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

public class TestDriveScheduleDAO {

    private static final String TABLE_NAME = "TestDriveSchedule";

    private TestDriveScheduleDTO mapToTestDriveSchedule(ResultSet rs) throws SQLException {
        return new TestDriveScheduleDTO(
                rs.getInt("appointment_id"),
                rs.getInt("customer_id"),
                rs.getString("serial_id"),
                rs.getString("date"),
                rs.getString("status")
        );
    }

    public List<TestDriveScheduleDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
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

    public TestDriveScheduleDTO create(
            int customer_id,
            String serial_id,
            String date,
            String status) {

        String checkSql = "SELECT COUNT(*) FROM " + TABLE_NAME + " WHERE serial_id = ? AND date = ?";
        try (Connection conn = DbUtils.getConnection(); PreparedStatement checkPs = conn.prepareStatement(checkSql)) {

            checkPs.setString(1, serial_id);
            checkPs.setString(2, date);

            try (ResultSet rs = checkPs.executeQuery()) {
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

        String insertSql = "INSERT INTO " + TABLE_NAME
                + " (customer_id, serial_id, date, status)"
                + " VALUES (?, ?, ?, ?)";

        int generatedAppointmentId = -1;

        try (Connection conn = DbUtils.getConnection();
             PreparedStatement insertPs = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {

            insertPs.setInt(1, customer_id);
            insertPs.setString(2, serial_id);
            insertPs.setString(3, date);
            insertPs.setString(4, status);

            int affectedRows = insertPs.executeUpdate();

            if (affectedRows > 0) {
                try (ResultSet rs = insertPs.getGeneratedKeys()) {
                    if (rs.next()) {
                        generatedAppointmentId = rs.getInt(1);
                    }
                }

                if (generatedAppointmentId != -1) {
                    return new TestDriveScheduleDTO(generatedAppointmentId, customer_id, serial_id, date, status);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public TestDriveScheduleDTO getTestDriveScheduleByCustomerId(int customer_id) {
        List<TestDriveScheduleDTO> results = retrieve("customer_id=?", customer_id);
        return (results != null && !results.isEmpty()) ? results.get(0) : null;
    }

    public TestDriveScheduleDTO updateStatus(int appointment_id, String status) {
        String updateSql = "UPDATE " + TABLE_NAME + " SET status=? WHERE appointment_id=?";
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(updateSql)) {

            ps.setString(1, status);
            ps.setInt(2, appointment_id);

            if (ps.executeUpdate() > 0) {

                List<TestDriveScheduleDTO> results = retrieve("appointment_id=?", appointment_id);

                if (results != null && !results.isEmpty()) {
                    return results.get(0);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}