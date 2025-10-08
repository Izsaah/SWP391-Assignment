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
        try (Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            ResultSet rs = ps.executeQuery();
            List<ConfirmationDTO> list = new ArrayList<>();
            while (rs.next()) {
                list.add(mapToConfirmation(rs));
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public ConfirmationDTO insert(int special_order_id, String agreement, String status) throws ClassNotFoundException, SQLException {

        ConfirmationDTO confirmation = new ConfirmationDTO();

        confirmation.setSpecialOrderId(special_order_id);
        confirmation.setAgreement(agreement);
        confirmation.setStatus(status);

        String sql = "INSERT INTO " + TABLE_NAME + " (special_order_id,agreement,status) VALUES(?,?,?)";

        try (Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, special_order_id);
            ps.setString(2, agreement);
            ps.setString(3, status);

            if (ps.executeUpdate() > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {

                        confirmation.setConfirmationId(rs.getInt(1));
                    }
                }
                return confirmation;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public ConfirmationDTO getConfirmationBySpecialOrderId(int id) {
        // Corrected to safely handle no results
        List<ConfirmationDTO> results = retrieve("special_order_id=?", id);
        if (results != null && !results.isEmpty()) {
            return results.get(0);
        }
        return null;
    }

    /**
     * Updates only the status of a specific confirmation record and returns the updated DTO.
     * @param confirmationId The unique ID of the confirmation to update.
     * @param newStatus The new status value (e.g., "APPROVED", "DENIED", "COMPLETED").
     * @return The updated ConfirmationDTO object, or null if the update failed.
     */
    public ConfirmationDTO updateStatus(int confirmationId, String newStatus) {
        String updateSql = "UPDATE " + TABLE_NAME + " SET status = ? WHERE confirmation_id = ?";

        try (Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(updateSql)) {

            ps.setString(1, newStatus);
            ps.setInt(2, confirmationId);

            // 1. Execute the update
            if (ps.executeUpdate() > 0) {

                // 2. If successful, retrieve the fully updated record
                List<ConfirmationDTO> results = retrieve("confirmation_id=?", confirmationId);

                if (results != null && !results.isEmpty()) {
                    // 3. Return the updated DTO
                    return results.get(0);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        // Return null if the update failed or the record couldn't be retrieved
        return null;
    }
}