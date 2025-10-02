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
import model.dto.VehicleModelDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class VehicleModelDAO {
    private static final String TABLE_NAME = "VehicleModel";
    private VehicleModelDTO mapToVehicleModel(ResultSet rs) throws SQLException {
        return new VehicleModelDTO(
            rs.getInt("model_id"),
            rs.getString("model_name"),
            rs.getString("description"),
            rs.getBoolean("is_active")
        );
    }

    public List<VehicleModelDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<VehicleModelDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToVehicleModel(rs));
            return list;
        } catch (Exception e) {
            System.err.println("Error in retrieve(): " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }
}
