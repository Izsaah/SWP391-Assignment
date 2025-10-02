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
import model.dto.ConfirmationDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class ConfirmationDAO {
    private static final String TABLE_NAME = "Confirmation";
    
    private ConfirmationDTO mapToConfirmation(ResultSet rs) throws SQLException {
        return new ConfirmationDTO(
            rs.getInt("confirmation_id"),
            rs.getInt("user_id"),
            rs.getInt("special_order_id"),
            rs.getString("agreement"),
            rs.getString("status")
        );
    }
    
    public List<ConfirmationDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<ConfirmationDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToConfirmation(rs));
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
