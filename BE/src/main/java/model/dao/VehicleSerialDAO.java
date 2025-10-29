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
import java.util.UUID;
import model.dto.VehicleSerialDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class VehicleSerialDAO {

    private static final String TABLE_NAME = "VehicleSerial";
    private static final String INSERT_SQL = "INSERT INTO " + TABLE_NAME + " (serial_id, variant_id) VALUES (?, ?)";

    private VehicleSerialDTO mapToVehicleSerial(ResultSet rs) throws SQLException {
        return new model.dto.VehicleSerialDTO(
                rs.getString("serial_id"),
                rs.getInt("variant_id")
        );
    }

    public List<VehicleSerialDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            ResultSet rs = ps.executeQuery();
            List<VehicleSerialDTO> list = new ArrayList<>();
            while (rs.next()) {
                list.add(mapToVehicleSerial(rs));
            }
            return list;
        } catch (Exception e) {
            System.err.println("Error in retrieve(): " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public String generateSerialId() {
        String uuid = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
        return uuid;
    }

    public int create(Connection conn, VehicleSerialDTO serial) throws SQLException {
        try ( PreparedStatement ps = conn.prepareStatement(INSERT_SQL)) {
            ps.setString(1, serial.getSerialId());
            ps.setInt(2, serial.getVariantId());
            return ps.executeUpdate();
        }
    }
    
    public VehicleSerialDTO getSerialBySerialId(String serialId){
        List<VehicleSerialDTO> lists = retrieve("serial_id = ?", serialId);
        return lists.get(0);
    }

}
