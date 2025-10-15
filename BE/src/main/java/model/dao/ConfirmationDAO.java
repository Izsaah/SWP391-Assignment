package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import model.dto.ConfirmationDTO;
import utils.DbUtils;

public class ConfirmationDAO {

    private static final String TABLE_NAME = "Confirmation";

    private ConfirmationDTO mapToConfirmation(ResultSet rs) throws SQLException {
        return new ConfirmationDTO(
                rs.getInt("confirmation_id"),
                rs.getInt("staff_admin"),
                rs.getInt("order_detail_id"),
                rs.getString("agreement"),
                rs.getString("date_time")
        );
    }

    public List<ConfirmationDTO> retrieve(String condition, Object... params) throws SQLException, ClassNotFoundException {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            ResultSet rs = ps.executeQuery();
            List<ConfirmationDTO> list = new ArrayList<>();
            while (rs.next()) {
                list.add(mapToConfirmation(rs));
            }
            return list;
        }
    }

    // Transaction-aware insert method using Connection parameter
    public ConfirmationDTO insert(Connection conn, int orderDetailId, String agreement, String date) throws SQLException {
        ConfirmationDTO confirmation = new ConfirmationDTO();
        confirmation.setOrderDetailId(orderDetailId);
        confirmation.setAgreement(agreement);
        confirmation.setDate(date);

        String sql = "INSERT INTO " + TABLE_NAME + " (order_detail_id, agreement, date_time) VALUES(?,?,?)";

        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, orderDetailId);
            ps.setString(2, agreement);
            ps.setString(3, date);

            if (ps.executeUpdate() > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        confirmation.setConfirmationId(rs.getInt(1));
                    }
                }
                return confirmation;
            }
        }
        throw new SQLException("Failed to insert confirmation");
    }

    // Legacy method - creates its own connection
    public ConfirmationDTO insert(int orderDetailId, String agreement, String date) throws ClassNotFoundException, SQLException {
        try (Connection conn = DbUtils.getConnection()) {
            return insert(conn, orderDetailId, agreement, date);
        }
    }

    public ConfirmationDTO getConfirmationByOrderDetailId(int id) throws SQLException, ClassNotFoundException {
        List<ConfirmationDTO> results = retrieve("order_detail_id = ?", id);
        if (results != null && !results.isEmpty()) {
            return results.get(0);
        }
        return null;
    }

    // Transaction-aware update method using Connection parameter
    public ConfirmationDTO updateStatus(Connection conn, int confirmationId, String agreement) throws SQLException {
        String updateSql = "UPDATE " + TABLE_NAME + " SET agreement = ? WHERE confirmation_id = ?";

        try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
            ps.setString(1, agreement);
            ps.setInt(2, confirmationId);

            if (ps.executeUpdate() > 0) {
                // Retrieve within the same connection/transaction
                String selectSql = "SELECT * FROM " + TABLE_NAME + " WHERE confirmation_id = ?";
                try (PreparedStatement selectPs = conn.prepareStatement(selectSql)) {
                    selectPs.setInt(1, confirmationId);
                    ResultSet rs = selectPs.executeQuery();
                    if (rs.next()) {
                        return mapToConfirmation(rs);
                    }
                }
            }
        }
        throw new SQLException("Failed to update confirmation status");
    }

    // Legacy method - creates its own connection
    public ConfirmationDTO updateStatus(int confirmationId, String agreement) throws SQLException, ClassNotFoundException {
        try (Connection conn = DbUtils.getConnection()) {
            return updateStatus(conn, confirmationId, agreement);
        }
    }

    public List<ConfirmationDTO> GetConfirmationBySpecialOrderId(int id) throws SQLException, ClassNotFoundException {
        return retrieve("special_order_id=?", id);
    }
}