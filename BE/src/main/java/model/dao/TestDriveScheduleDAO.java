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
                rs.getString("serial_id"),
                rs.getString("scheduled_id"),
                rs.getString("date"),
                rs.getString("status")
        );
    }

    public List<TestDriveScheduleDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            ResultSet rs = ps.executeQuery();
            List<TestDriveScheduleDTO> list = new ArrayList<>();
            while (rs.next()) {
                list.add(mapToTestDriveSchedule(rs));
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }


// ... (other parts of TestDriveScheduleDAO)
    public TestDriveScheduleDTO create(
   // This parameter will now be ignored for the generated key logic
            int customer_id,
            String serial_id,
            String schedule_id,
            String date,
            String status) {

        // 1. Check for existing schedule with the same model_id and date
        // NOTE: Ensure TABLE_NAME is correctly defined (e.g., "TestDriveSchedule")
        String checkSql = "SELECT COUNT(*) FROM " + TABLE_NAME + " WHERE serial_id = ? AND date = ?";
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement checkPs = conn.prepareStatement(checkSql)) {

            checkPs.setString(1, serial_id);
            checkPs.setString(2, date);

            try ( ResultSet rs = checkPs.executeQuery()) {
                if (rs.next() && rs.getInt(1) > 0) {
                    return null;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        // 2. Proceed with insertion and retrieval of the generated key
        // Note: appointment_id is removed from the column list since it's auto-generated
        String insertSql = "INSERT INTO " + TABLE_NAME
                + " (customer_id, serial_id, scheduled_id, date, status)"
                + " VALUES (?, ?, ?, ?, ?)"; // Only 5 placeholders now

        int generatedAppointmentId = -1; // Initialize a variable to hold the generated key

        try ( Connection conn = DbUtils.getConnection(); // *** KEY CHANGE 1: Use Statement.RETURN_GENERATED_KEYS ***
                  PreparedStatement insertPs = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {

            // The parameters mapping should be checked against the SQL statement:
            insertPs.setInt(1, customer_id);
            insertPs.setString(2, serial_id);
            insertPs.setString(3, schedule_id);
            insertPs.setString(4, date);
            insertPs.setString(5, status);

            int affectedRows = insertPs.executeUpdate();

            if (affectedRows > 0) {
                // *** KEY CHANGE 2: Retrieve the generated key ***
                try ( ResultSet rs = insertPs.getGeneratedKeys()) {
                    if (rs.next()) {
                        generatedAppointmentId = rs.getInt(1);
                    }
                }

                // Only return the DTO if the key was successfully retrieved
                if (generatedAppointmentId != -1) {
                    return new TestDriveScheduleDTO(
                            generatedAppointmentId, // Use the generated ID
                            customer_id,
                            serial_id,
                            schedule_id,
                            date,
                            status
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null; // Return null if insertion/key retrieval fails
    }


    public TestDriveScheduleDTO getTestDriveScheduleByCustomerId(int customer_id) {
        return retrieve("customer_id=?", customer_id).get(0);
    }

    public TestDriveScheduleDTO updateStatus(int appointment_id, String status) {
        String updateSql = "UPDATE" + TABLE_NAME + "SET status=? WHERE appointment_id=?";
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(updateSql)) {

            ps.setString(1, status);
            ps.setInt(2, appointment_id);

            // 1. Execute the update
            if (ps.executeUpdate() > 0) {

                // 2. If successful, retrieve the fully updated record
                List<TestDriveScheduleDTO> results = retrieve("appointment_id=?", appointment_id);

                if (results != null && !results.isEmpty()) {
                    // 3. Return the updated DTO
                    return results.get(0);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
