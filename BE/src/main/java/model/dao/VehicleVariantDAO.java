/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import model.dto.VehicleVariantDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class VehicleVariantDAO {
    private static final String TABLE_NAME = "VehicleVariant";
    private static final String INSERT_SQL = "INSERT INTO " + TABLE_NAME +
            " (model_id, version_name, color, price, is_active) VALUES (?, ?, ?, ?, ?)";

    private VehicleVariantDTO mapToVehicleVariant(ResultSet rs) throws SQLException {
        return new VehicleVariantDTO(
            rs.getInt("variant_id"),
            rs.getInt("model_id"),
            rs.getString("version_name"),
            rs.getString("color"),
            rs.getString("image"),
            rs.getDouble("price"),
            rs.getBoolean("is_active")
        );
    }

    public List<VehicleVariantDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<VehicleVariantDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToVehicleVariant(rs));
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    
    public List<VehicleVariantDTO> viewVehicleVariantIsActive(int model_id){
        return retrieve("model_id = ? and is_active = 1", model_id);
    }
    
    public int create(Connection conn, VehicleVariantDTO variant) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(INSERT_SQL, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, variant.getModelId());
            ps.setString(2, variant.getVersionName());
            ps.setString(3, variant.getColor());
            ps.setDouble(4, variant.getPrice());
            ps.setBoolean(5, variant.isIsActive());

            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) throw new SQLException("Creating variant failed, no rows affected.");

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1); // trả về variant_id
                else throw new SQLException("Creating variant failed, no ID obtained.");
            }
        }
    }
    
}
