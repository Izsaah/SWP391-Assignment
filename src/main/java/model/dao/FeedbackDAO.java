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
import model.dto.FeedbackDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class FeedbackDAO {
    private static final String TABLE_NAME = "Feedback";
    
    private FeedbackDTO mapToFeedback(ResultSet rs) throws SQLException {
        return new FeedbackDTO(
            rs.getInt("feedback_id"),
            rs.getInt("customer_id"),
            rs.getInt("order_id"),
            rs.getString("type"),
            rs.getString("content"),
            rs.getString("status"),
            rs.getString("created_at")
        );
    }
    
    public List<FeedbackDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<FeedbackDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToFeedback(rs));
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
