/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import model.dao.ConfirmationDAO;
import model.dao.OrderDAO;
import model.dao.OrderDetailDAO;
import model.dao.VehicleSerialDAO;
import model.dao.VehicleVariantDAO;
import model.dto.OrderDTO;
import model.dto.OrderDetailDTO;
import model.dto.VehicleSerialDTO;
import model.dto.VehicleVariantDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class OrderService {

    ConfirmationDAO confirmationDAO = new ConfirmationDAO();
    OrderDAO orderDAO = new OrderDAO();
    VehicleVariantDAO variantDAO = new VehicleVariantDAO();
    VehicleSerialDAO vehicleSerialDAO = new VehicleSerialDAO();
    OrderDetailDAO orderDetailDAO = new OrderDetailDAO();

    public int HandlingCreateOrder(
            int customerId,
            int dealerId,
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

            // Tạo order
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            OrderDTO order = new OrderDTO(customerId, dealerId, modelId, currentDate, status);
            int orderId = orderDAO.create(conn, order);
            if (orderId <= 0) {
                throw new SQLException("Failed to create order");
            }

            // Nếu là hàng có sẵn (isCustom = false)
            if (!isCustom) {
                String generatedSerialId = vehicleSerialDAO.generateSerialId();
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
                // Tạo confirmation trước
                String agreement = "Pending";
                ConfirmationDAO confirmationDAO = new ConfirmationDAO();
                confirmationDAO.insert(orderId, agreement, currentDate);

                // 3️⃣ Tạo OrderDetail tạm thời (chưa có serialId)
                OrderDetailDTO detail = new OrderDetailDTO();
                detail.setOrderId(orderId);
                detail.setSerialId(null); // chưa có serialId
                detail.setQuantity(String.valueOf(quantity));
                detail.setUnitPrice(unitPrice);
                orderDetailDAO.create(conn, detail);
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

    public boolean approveCustomOrder(int orderId, boolean isAgree, double unitPrice) {
        Connection conn = null;
        try {
            conn = DbUtils.getConnection();
            conn.setAutoCommit(false);

            // Lấy order để biết model_id
            OrderDTO order = orderDAO.retrieve("order_id = ?", orderId)
                    .stream().findFirst().orElse(null);
            if (order == null) {
                throw new SQLException("Order not found");
            }
            int modelId = order.getModelId();

            // Lấy OrderDetail tạm thời chưa có serialId
            OrderDetailDTO detail = orderDetailDAO.retrieve("order_id = ? AND serial_id IS NULL", orderId)
                    .stream().findFirst().orElse(null);

            if (isAgree) {
                // Tạo variant mới từ model_id
                VehicleVariantDTO newVariant = new VehicleVariantDTO();
                newVariant.setModelId(modelId);
                newVariant.setVersionName("Custom Version");
                newVariant.setColor("Custom Color");
                newVariant.setPrice(unitPrice);
                newVariant.setIsActive(true);
                int variantId = variantDAO.create(conn, newVariant); // trả về variant_id mới

                // Tạo serial mới từ variant_id mới tạo
                String serialId = vehicleSerialDAO.generateSerialId();
                VehicleSerialDTO serial = new VehicleSerialDTO(serialId, variantId);
                vehicleSerialDAO.create(conn, serial);

                // Cập nhật OrderDetail với serialId mới
                if (detail != null) {
                    orderDetailDAO.updateSerialId(conn, detail.getOrderDetailId(), serialId);
                }

                // Cập nhật confirmation trạng thái "Agree"
                confirmationDAO.updateStatus(orderId, "Agree");

            } else {
                // Admin disagree → chỉ update confirmation
                confirmationDAO.updateStatus(orderId, "Disagree");
            }

            conn.commit();
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            if (conn != null) try {
                conn.rollback();
            } catch (SQLException ex) {
            }
            return false;
        } finally {
            if (conn != null) try {
                conn.setAutoCommit(true);
                conn.close();
            } catch (SQLException ex) {
            }
        }
    }

}
