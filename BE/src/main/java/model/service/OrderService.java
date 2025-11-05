package model.service;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import model.dao.ConfirmationDAO;
import model.dao.OrderDAO;
import model.dao.OrderDetailDAO;
import model.dao.VehicleSerialDAO;
import model.dao.VehicleVariantDAO;
import model.dto.ConfirmationDTO;
import model.dto.OrderDTO;
import model.dto.OrderDetailDTO;
import model.dto.VehicleSerialDTO;
import model.dto.VehicleVariantDTO;
import utils.DbUtils;

public class OrderService {

    private final ConfirmationDAO confirmationDAO = new ConfirmationDAO();
    private final OrderDAO orderDAO = new OrderDAO();
    private final VehicleVariantDAO variantDAO = new VehicleVariantDAO();
    private final VehicleSerialDAO vehicleSerialDAO = new VehicleSerialDAO();
    private final OrderDetailDAO orderDetailDAO = new OrderDetailDAO();
    
    public int HandlingCreateOrder(
            int customerId,
            int dealerstaffId,
            int modelId,
            String status,
            Integer variantId,
            int quantity,
            double unitPrice,
            boolean isCustom) {

        Connection conn = null;

        try {
            conn = DbUtils.getConnection();
            conn.setAutoCommit(false);

            // Create order
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            OrderDTO order = new OrderDTO(customerId, dealerstaffId, modelId, currentDate, status);
            int orderId = orderDAO.create(conn, order);
            if (orderId <= 0) {
                throw new SQLException("Failed to create order");
            }

            int finalVariantId;
            double finalUnitPrice;

            // Auto-generate variant if missing
            if (variantId == null || variantId <= 0) {
                VehicleVariantDTO newVariant = new VehicleVariantDTO();
                newVariant.setModelId(modelId);
                newVariant.setVersionName("Auto-Generated Version");
                newVariant.setColor("Default Color");
                newVariant.setPrice(0.0);
                newVariant.setIsActive(true);

                finalVariantId = variantDAO.create(conn, newVariant);
                if (finalVariantId <= 0) {
                    throw new SQLException("Failed to create variant");
                }
                finalUnitPrice = 0.0;
            } else {
                VehicleVariantDTO variant = variantDAO.findUnitPriceByVariantId(variantId);
                if (variant == null) {
                    throw new SQLException("Variant not found with ID: " + variantId);
                }
                finalVariantId = variantId;
                finalUnitPrice = variant.getPrice();
            }

            // Order details
            String serialId = null;
            if (!isCustom) {
                // Normal order: reuse or generate serial
                List<VehicleSerialDTO> existingSerials = vehicleSerialDAO.retrieve("variant_id = ?", finalVariantId);
                if (existingSerials != null && !existingSerials.isEmpty()) {
                    serialId = existingSerials.get(0).getSerialId();
                } else {
                    serialId = vehicleSerialDAO.generateSerialId();
                    VehicleSerialDTO serial = new VehicleSerialDTO(serialId, finalVariantId);
                    int createdSerial = vehicleSerialDAO.create(conn, serial);
                    if (createdSerial != 1) {
                        throw new SQLException("Failed to create vehicle serial");
                    }
                }
            } else {
                // Custom order: generate temporary serial
                serialId = vehicleSerialDAO.generateSerialId();
                VehicleSerialDTO serial = new VehicleSerialDTO(serialId, finalVariantId);
                vehicleSerialDAO.create(conn, serial);
            }

            // Insert OrderDetail
            OrderDetailDTO detail = new OrderDetailDTO();
            detail.setOrderId(orderId);
            detail.setSerialId(serialId);
            detail.setQuantity(String.valueOf(quantity));
            detail.setUnitPrice(finalUnitPrice);
            int orderDetailId = orderDetailDAO.create(conn, detail);
            if (orderDetailId <= 0) {
                throw new SQLException("Failed to insert order detail");
            }

            System.out.println("DEBUG: orderDetailId = " + orderDetailId);

            // Insert confirmation for custom orders (use the order_detail_id we just got)
            if (isCustom) {
                String agreement = "Pending";
                ConfirmationDTO confirmation = confirmationDAO.insert(conn, 1, orderDetailId, agreement, currentDate);
                if (confirmation == null) {
                    throw new SQLException("Failed to insert confirmation");
                }
                System.out.println("DEBUG: Confirmation inserted, ID = " + confirmation.getConfirmationId());
            }

            conn.commit();
            return orderId;

        } catch (Exception e) {
            e.printStackTrace();
            if (conn != null) try {
                conn.rollback();
            } catch (SQLException ex) {
            }
            return -1;
        } finally {
            if (conn != null) try {
                conn.setAutoCommit(true);
                conn.close();
            } catch (SQLException ex) {
            }
        }
    }

    public boolean approveCustomOrderByOrderId(int orderId, String decision, String versionName,
            String color, double unitPrice, int staffAdminId) {
        Connection conn = null;
        try {
            conn = DbUtils.getConnection();
            conn.setAutoCommit(false);

            // Get order detail
            OrderDetailDTO detail = orderDetailDAO.getOrderDetailByOrderId(orderId);
            if (detail == null) {
                throw new SQLException("No OrderDetail found for order_id = " + orderId);
            }

            int orderDetailId = detail.getOrderDetailId();
            String serialId = detail.getSerialId();
            if (serialId == null) {
                throw new SQLException("OrderDetail " + orderDetailId + " has no serial_id");
            }
            
            boolean updatedPrice = orderDetailDAO.updateUnitPrice(orderDetailId, unitPrice);
            if (!updatedPrice) {
                throw new SQLException("Failed to update unit_price for order_detail_id = " + orderDetailId);
            }

            // Get variantId via VehicleSerial
            VehicleSerialDTO serial = vehicleSerialDAO.getSerialBySerialId(serialId);
            if (serial == null) {
                throw new SQLException("No variant found for serial_id = " + serialId);
            }
            int variantId = serial.getVariantId();

            // Get confirmation for this order detail
            ConfirmationDTO confirmation = confirmationDAO.getConfirmationByOrderDetailId(orderDetailId);
            if (confirmation == null) {
                throw new SQLException("No confirmation found for order_detail_id = " + orderDetailId);
            }

            // Update confirmation with decision & staff_admin_id
            ConfirmationDTO updatedConfirmation = confirmationDAO.updateStatus(
                    confirmation.getConfirmationId(),
                    decision,
                    staffAdminId
            );

            if (updatedConfirmation == null) {
                throw new SQLException("Failed to update confirmation for confirmation_id = " + confirmation.getConfirmationId());
            }

            // Take action based on decision
            if (decision.equalsIgnoreCase("Agree")) {
                // Update VehicleVariant
                boolean updated = variantDAO.updateVariantById(variantId, versionName, color);
                if (!updated) {
                    throw new SQLException("Failed to update VehicleVariant for variant_id = " + variantId);
                }
                System.out.println("INFO: Custom order approved. Updated variant_id = " + variantId);

            } else if (decision.equalsIgnoreCase("Disagree")) {

                // Delete Order
                boolean orderDeleted = orderDAO.deleteById(conn, orderId);
                if (!orderDeleted) {
                    throw new SQLException("Failed to delete order_id = " + orderId);
                }
                System.out.println("INFO: Custom order rejected. Deleted order_id = " + orderId);
            } else {
                System.out.println("INFO: Custom order decision is pending. No action taken.");
            }

            conn.commit();
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            if (conn != null) try {
                conn.rollback();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
            return false;
        } finally {
            if (conn != null) try {
                conn.setAutoCommit(true);
                conn.close();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        }
    }

    public List<OrderDTO> GetListOrderByDealerStaffId(int dealerStaffId) {
        try {
            List<OrderDTO> orderList = orderDAO.getByStaffId(dealerStaffId);

            if (orderList == null || orderList.isEmpty()) {
                return Collections.emptyList();
            }

            for (OrderDTO order : orderList) {
                OrderDetailDTO detail = orderDetailDAO.getOrderDetailByOrderId(order.getOrderId());
                order.setDetail(detail);
            }

            return orderList;
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public List<OrderDTO> HandlingGetOrdersByCustomerId(int customerId) {
        try {
            List<OrderDTO> orderList = orderDAO.getByCustomerId(customerId);

            if (orderList == null || orderList.isEmpty()) {
                return Collections.emptyList();
            }

            for (OrderDTO order : orderList) {

                OrderDetailDTO detail = orderDetailDAO.getOrderDetailByOrderId(order.getOrderId());
                order.setDetail(detail);

                if (detail != null) {

                    ConfirmationDTO confirmation = confirmationDAO.getConfirmationByOrderDetailId(detail.getOrderDetailId());

                    if (confirmation != null) {
                        order.setConfirmation(confirmation);
                        order.setIsCustom(true);
                    } else {
                        order.setIsCustom(false);
                    }
                }
            }

            return orderList;
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
    public boolean updateOrderStatus(int orderId, String newStatus)
            throws SQLException, ClassNotFoundException {

        // Validate trực tiếp trong code — chỉ 3 status hợp lệ
        if (!newStatus.equalsIgnoreCase("pending")
                && !newStatus.equalsIgnoreCase("delivered")
                && !newStatus.equalsIgnoreCase("cancelled")) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }

        try (Connection conn = DbUtils.getConnection()) {
            conn.setAutoCommit(false);

            boolean success = orderDAO.updateStatus(orderId, newStatus);

            conn.commit();
            return success;
        }
    }
    public List<Map<String, Object>> retrieveOrdersWithConfirmedDetails(int orderDetailId)
            throws SQLException, ClassNotFoundException {
        return orderDAO.retrieveOrdersWithConfirmedDetails(orderDetailId);
    }
    
    public List<ConfirmationDTO> getAllConfirmation() throws SQLException, ClassNotFoundException{
        return confirmationDAO.viewConfirmations();
    }
    
    public List<ConfirmationDTO> getConfirmationByOrderDetailId(int orderDetailId) 
            throws SQLException, ClassNotFoundException{
        return confirmationDAO.viewConfirmationsByOrderDetailId(orderDetailId);
    }
            
}
