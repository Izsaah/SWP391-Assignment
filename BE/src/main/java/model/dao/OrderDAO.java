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
import model.dto.OrderDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class OrderDAO {
    private static final String TABLE_NAME = "Order";
    
    private OrderDTO mapToOrder(ResultSet rs) throws SQLException {
        return new OrderDTO(
            rs.getInt("order_id"),
            rs.getInt("customer_id"),
            rs.getInt("dealer_id"),
            rs.getInt("dealer_staff_id"),
            rs.getString("order_date"),
            rs.getString("status")
        );
    }
    
    public List<OrderDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<OrderDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToOrder(rs));
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    
    
}
