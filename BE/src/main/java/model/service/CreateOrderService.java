/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import model.dao.OrderDAO;
import model.dao.OrderDetailDAO;
import model.dto.OrderDTO;
import model.dto.OrderDetailDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class CreateOrderService {

    private OrderDAO orderDAO = new OrderDAO();
    private OrderDetailDAO orderDetailDAO = new OrderDetailDAO();

    public int HandlingCreateOrder(
            int customerId,
            int dealerId,
            int dealerStaffId,
            String status,
            int variantId,
            int quantity,
            double unitPrice) {

        Connection conn = null;

        try {
            // Establish connection and begin transaction
            conn = DbUtils.getConnection();
            conn.setAutoCommit(false);

            // Build OrderDTO
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            OrderDTO order = new OrderDTO(customerId, dealerId, dealerStaffId, currentDate, status);

            // Insert order and get generated order_id
            int orderId = orderDAO.create(conn, order);
            if (orderId <= 0) {
                throw new SQLException("Failed to create order");
            }

            // OrderDetailDTO
            OrderDetailDTO detail = new OrderDetailDTO();
            detail.setOrderId(orderId);
            detail.setVariantId(variantId);
            detail.setQuantity(String.valueOf(quantity));
            detail.setUnitPrice(unitPrice);

            // Insert order detail
            int inserted = orderDetailDAO.create(conn, detail);
            if (inserted != 1) {
                throw new SQLException("Failed to insert order detail");
            }

            // Commit transaction
            conn.commit();
            return orderId;

        } catch (Exception e) {
            e.printStackTrace();

            // Rollback if error occurs
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            return -1;

        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
