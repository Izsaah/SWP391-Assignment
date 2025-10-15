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
import model.dto.PaymentDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class PaymentDAO {
    private static final String TABLE_NAME = "Payment";
    
    private PaymentDTO mapToPayment(ResultSet rs) throws SQLException {
        return new PaymentDTO(
            rs.getInt("payment_id"),
            rs.getInt("order_id"),
            rs.getString("payment_type"),
            rs.getDouble("amount"),
            rs.getString("payment_date")
        );
    }
    
    public List<PaymentDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<PaymentDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToPayment(rs));
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    public List<PaymentDTO> getPayMentsByOrderId(int OrderId){
    return retrieve("order_id=?", OrderId);
    }

}
