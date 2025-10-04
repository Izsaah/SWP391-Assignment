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
import model.dto.TestDriveScheduleDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class TestDriveScheduleDAO {
    private static final String TABLE_NAME = "TestDriveSchedule";

    private TestDriveScheduleDTO mapToTestDriveSchedule(ResultSet rs) throws SQLException {
        return new TestDriveScheduleDTO(
            rs.getInt("appointment_id"),
            rs.getInt("customer_id"),
            rs.getInt("model_id"),
            rs.getString("scheduled_id"),
            rs.getString("date"),
            rs.getString("status")
        );
    }

    public List<TestDriveScheduleDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<TestDriveScheduleDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToTestDriveSchedule(rs));
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
