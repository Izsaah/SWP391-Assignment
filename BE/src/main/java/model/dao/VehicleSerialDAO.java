/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import model.dto.VehicleSerialDTO;

/**
 *
 * @author Admin
 */
public class VehicleSerialDAO {
    private static final String TABLE_NAME = "VehicleSerial";
    private VehicleSerialDTO mapToVehicleSerial(ResultSet rs) throws SQLException {
        return new model.dto.VehicleSerialDTO(
            rs.getString("serial_id"),
            rs.getInt("model_id")
        );
    }
}
