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
                rs.getString("schedule_at"), // changed from "date"
                rs.getString("status")
        );
    }

    public List<TestDriveScheduleDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        List<TestDriveScheduleDTO> list = new ArrayList<>();
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {

            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }

            try ( ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapToTestDriveSchedule(rs));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public TestDriveScheduleDTO create(int customer_id, String serial_id, String scheduleAt, String status) throws ClassNotFoundException {
        String checkSql = "SELECT COUNT(*) FROM " + TABLE_NAME + " WHERE serial_id = ? AND schedule_at = ?";
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement checkPs = conn.prepareStatement(checkSql)) {

            checkPs.setString(1, serial_id);
            checkPs.setString(2, scheduleAt);

            try ( ResultSet rs = checkPs.executeQuery()) {
                if (rs.next() && rs.getInt(1) > 0) {
                    return null;
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }

        String insertSql = "INSERT INTO " + TABLE_NAME
                + " (customer_id, serial_id, schedule_at, status) VALUES (?, ?, ?, ?)";

        try ( Connection conn = DbUtils.getConnection();  PreparedStatement insertPs = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {

            insertPs.setInt(1, customer_id);
            insertPs.setString(2, serial_id);
            insertPs.setString(3, scheduleAt);
            insertPs.setString(4, status);

            int affectedRows = insertPs.executeUpdate();
            if (affectedRows > 0) {
                try ( ResultSet rs = insertPs.getGeneratedKeys()) {
                    if (rs.next()) {
                        return new TestDriveScheduleDTO(rs.getInt(1), customer_id, serial_id, scheduleAt, status);
                    }
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return null;
    }

    public TestDriveScheduleDTO getTestDriveScheduleByCustomerId(int customer_id) {
        List<TestDriveScheduleDTO> results = retrieve("customer_id=?", customer_id);
        return (results != null && !results.isEmpty()) ? results.get(0) : null;
    }

    public TestDriveScheduleDTO getTestDriveScheduleByCustomerIdAndDealer(int customerId, int dealerId) throws ClassNotFoundException {
        String query = "SELECT DISTINCT tds.appointment_id, tds.customer_id, tds.serial_id, tds.schedule_at, tds.status "
                + "FROM TestDriveSchedule tds "
                + "INNER JOIN [Order] o ON tds.customer_id = o.customer_id "
                + "INNER JOIN [UserAccount] ua ON o.dealer_staff_id = ua.user_id "
                + "WHERE tds.customer_id = ? AND ua.dealer_id = ?";

        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setInt(1, customerId);
            ps.setInt(2, dealerId);

            try ( ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new TestDriveScheduleDTO(
                            rs.getInt("appointment_id"),
                            rs.getInt("customer_id"),
                            rs.getString("serial_id"),
                            rs.getString("schedule_at"),
                            rs.getString("status")
                    );
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return null;
    }

    public List<TestDriveScheduleDTO> getTestDriveSchedulesByDealer(int dealerId) throws ClassNotFoundException {
        String query = "SELECT DISTINCT tds.appointment_id, tds.customer_id, tds.serial_id, tds.schedule_at, tds.status "
                + "FROM TestDriveSchedule tds "
                + "INNER JOIN [Order] o ON tds.customer_id = o.customer_id "
                + "INNER JOIN [UserAccount] ua ON o.dealer_staff_id = ua.user_id "
                + "WHERE ua.dealer_id = ?";

        List<TestDriveScheduleDTO> list = new ArrayList<>();
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setInt(1, dealerId);
            try ( ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(new TestDriveScheduleDTO(
                            rs.getInt("appointment_id"),
                            rs.getInt("customer_id"),
                            rs.getString("serial_id"),
                            rs.getString("schedule_at"),
                            rs.getString("status")
                    ));
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return list;
    }

    public TestDriveScheduleDTO updateStatus(int appointment_id, String status) {
        String updateSql = "UPDATE " + TABLE_NAME + " SET status=? WHERE appointment_id=?";
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(updateSql)) {

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
