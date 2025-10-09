/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import model.dto.OrderDetailDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class OrderDetailDAO {
    private static final String TABLE_NAME = "OrderDetail";
    private static final String INSERT_ORDER_DETAIL = "INSERT INTO " + TABLE_NAME
            + " (order_id, serial_id, quantity, unit_price) VALUES (?, ?, ?, ?)";

    
    private OrderDetailDTO mapToOrderDetail(ResultSet rs) throws SQLException {
        return new OrderDetailDTO(
            rs.getInt("order_detail_id"),
            rs.getInt("order_id"),
            rs.getString("serial_id"),
            rs.getString("quantity"),
            rs.getDouble("unit_price")
        );
    }
    
    public List<OrderDetailDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<OrderDetailDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToOrderDetail(rs));
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    
    public int create(Connection conn, OrderDetailDTO detail) throws SQLException {
        try ( PreparedStatement ps = conn.prepareStatement(INSERT_ORDER_DETAIL)) {
            ps.setInt(1, detail.getOrderId());       // use orderId from Order
            ps.setString(2, detail.getSerialId());     // variantId
            ps.setInt(3, Integer.parseInt(detail.getQuantity())); // quantity as int
            ps.setDouble(4, detail.getUnitPrice());  // unit price

            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating order detail failed, no rows affected.");
            }
            return affectedRows;
        }
    }
    
    
    public int updateSerialId(Connection conn, int orderDetailId, String serialId) throws SQLException {
        String sql = "UPDATE OrderDetail SET serial_id = ? WHERE order_detail_id = ?";
        try ( PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, serialId);
            ps.setInt(2, orderDetailId);
            return ps.executeUpdate();
        }
    }
}
