package model.service;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
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
            int dealerStaffId,
            int modelId,
            String status,
            int variantId,
            int quantity,
            double unitPrice,
            boolean isCustom) {

        Connection conn = null;

        try {
            conn = DbUtils.getConnection();
            conn.setAutoCommit(false);

            // Create order
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            OrderDTO order = new OrderDTO(0, customerId, dealerStaffId, modelId, currentDate, status);
            int orderId = orderDAO.create(conn, order);
            if (orderId <= 0) {
                throw new SQLException("Failed to create order");
            }

            if (!isCustom) {
                // For ready stock
                String generatedSerialId = vehicleSerialDAO.generateSerialId();
                if (generatedSerialId == null || generatedSerialId.trim().isEmpty()) {
                    throw new SQLException("Failed to generate serial ID");
                }
                
                VehicleSerialDTO serial = new VehicleSerialDTO(generatedSerialId, variantId);
                int createdSerial = vehicleSerialDAO.create(conn, serial);
                if (createdSerial != 1) {
                    throw new SQLException("Failed to create vehicle serial");
                }

                OrderDetailDTO detail = new OrderDetailDTO();
                detail.setOrderId(orderId);
                detail.setSerialId(generatedSerialId);
                detail.setQuantity(String.valueOf(quantity));
                detail.setUnitPrice(unitPrice);

                int inserted = orderDetailDAO.create(conn, detail);
                if (inserted != 1) {
                    throw new SQLException("Failed to insert order detail");
                }

            } else {
                // For custom order - create OrderDetail first, then Confirmation
                OrderDetailDTO detail = new OrderDetailDTO();
                detail.setOrderId(orderId);
                detail.setSerialId(null); // No serial ID yet for custom orders
                detail.setQuantity(String.valueOf(quantity));
                detail.setUnitPrice(unitPrice);
                
                int inserted = orderDetailDAO.create(conn, detail);
                if (inserted != 1) {
                    throw new SQLException("Failed to insert order detail");
                }

                // Get the generated order_detail_id from the created detail
                List<OrderDetailDTO> createdDetails = orderDetailDAO.retrieveWithConnection(conn, "order_id = ?", orderId);
                if (createdDetails == null || createdDetails.isEmpty()) {
                    throw new SQLException("Failed to retrieve created order detail");
                }
                int orderDetailId = createdDetails.get(0).getOrderDetailId();

                // Create confirmation using order_detail_id
                String agreement = "Pending";
                ConfirmationDTO confirmation = confirmationDAO.insert(conn, orderDetailId, agreement, currentDate);
                if (confirmation == null) {
                    throw new SQLException("Failed to create confirmation");
                }
            }

            conn.commit();
            return orderId;

        } catch (Exception e) {
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                    System.out.println("Transaction rolled back due to error: " + e.getMessage());
                } catch (SQLException ex) {
                    System.err.println("Rollback failed: " + ex.getMessage());
                }
            }
            return -1;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException ex) {
                    System.err.println("Failed to close connection: " + ex.getMessage());
                }
            }
        }
    }

    public boolean approveCustomOrder(int orderId, boolean isAgree, double unitPrice) {
        Connection conn = null;
        try {
            conn = DbUtils.getConnection();
            conn.setAutoCommit(false);

            // Get order to know model_id
            OrderDTO order = orderDAO.getById(orderId);
            if (order == null) {
                throw new SQLException("Order not found");
            }
            int modelId = order.getModelId();

            // Get temporary OrderDetail without serialId
            List<OrderDetailDTO> detailList = orderDetailDAO.retrieveWithConnection(conn, "order_id = ? AND serial_id IS NULL", orderId);
            OrderDetailDTO detail = (detailList != null && !detailList.isEmpty()) ? detailList.get(0) : null;
            
            if (detail == null) {
                throw new SQLException("Order detail not found");
            }

            // Get confirmation by order_detail_id
            ConfirmationDTO confirmation = confirmationDAO.getConfirmationByOrderDetailId(detail.getOrderDetailId());
            if (confirmation == null) {
                throw new SQLException("Confirmation not found for this order detail");
            }

            if (isAgree) {
                // Create new variant from model_id
                VehicleVariantDTO newVariant = new VehicleVariantDTO();
                newVariant.setModelId(modelId);
                newVariant.setVersionName("Custom Version");
                newVariant.setColor("Custom Color");
                newVariant.setPrice(unitPrice);
                newVariant.setIsActive(true);
                int variantId = variantDAO.create(conn, newVariant);
                if (variantId <= 0) {
                    throw new SQLException("Failed to create variant");
                }

                // Create new serial from new variant
                String serialId = vehicleSerialDAO.generateSerialId();
                if (serialId == null || serialId.trim().isEmpty()) {
                    throw new SQLException("Failed to generate serial ID");
                }
                
                VehicleSerialDTO serial = new VehicleSerialDTO(serialId, variantId);
                int serialCreated = vehicleSerialDAO.create(conn, serial);
                if (serialCreated != 1) {
                    throw new SQLException("Failed to create vehicle serial");
                }

                // Update OrderDetail with new serialId
                int updated = orderDetailDAO.updateSerialId(conn, detail.getOrderDetailId(), serialId);
                if (updated != 1) {
                    throw new SQLException("Failed to update order detail with serial ID");
                }

                // Update confirmation status to "Agree"
                ConfirmationDTO updatedConfirmation = confirmationDAO.updateStatus(conn, confirmation.getConfirmationId(), "Agree");
                if (updatedConfirmation == null) {
                    throw new SQLException("Failed to update confirmation status");
                }

            } else {
                // Admin disagrees - only update confirmation
                ConfirmationDTO updatedConfirmation = confirmationDAO.updateStatus(conn, confirmation.getConfirmationId(), "Disagree");
                if (updatedConfirmation == null) {
                    throw new SQLException("Failed to update confirmation status");
                }
            }

            conn.commit();
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                    System.out.println("Transaction rolled back due to error: " + e.getMessage());
                } catch (SQLException ex) {
                    System.err.println("Rollback failed: " + ex.getMessage());
                }
            }
            return false;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException ex) {
                    System.err.println("Failed to close connection: " + ex.getMessage());
                }
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
}