package model.dao;

import java.sql.*;
import java.util.*;
import model.dto.RoleDTO;
import model.dto.UserAccountDTO;
import utils.DbUtils;

public class UserAccountDAO {

    private static final String TABLE_NAME = "[UserAccount]";
    private static final String SEARCH_SQL =
        "SELECT u.user_id, u.dealer_id, u.username, u.email, u.phone_number " +
        "FROM UserAccount u JOIN UserRole ur ON u.user_id = ur.user_id " +
        "WHERE ur.role_id in (1,2) AND u.username LIKE ?";

    private UserAccountDTO mapToUser(ResultSet rs) throws SQLException {
        return new UserAccountDTO(
            rs.getInt("user_id"),
            rs.getInt("dealer_id"),
            rs.getString("email"),
            rs.getString("username"),
            rs.getString("phone_number")
        );
    }

    public List<UserAccountDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<UserAccountDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToUser(rs));
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public UserAccountDTO getUserById(int userId) {
        List<UserAccountDTO> users = retrieve("user_id=?", userId);
        return (users != null && !users.isEmpty()) ? users.get(0) : null;
    }

    public List<RoleDTO> getUserRoles(int userId) {
        List<RoleDTO> roles = new ArrayList<>();
        String sql = "SELECT r.role_id, r.role_name FROM Role r " +
                     "JOIN UserRole ur ON r.role_id = ur.role_id WHERE ur.user_id = ?";
        try (Connection conn = DbUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) roles.add(new RoleDTO(rs.getInt("role_id"), rs.getString("role_name")));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return roles;
    }

    public UserAccountDTO login(String email, String password) {
        List<UserAccountDTO> users = retrieve("email = ? AND password = ?", email, password);
        return (users != null && !users.isEmpty()) ? users.get(0) : null;
    }

    public List<UserAccountDTO> searchDealerStaffAndManagerByName(String name) {
        List<UserAccountDTO> list = new ArrayList<>();
        try (Connection conn = DbUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(SEARCH_SQL)) {
            ps.setString(1, "%" + name.trim() + "%");
            ResultSet rs = ps.executeQuery();
            while (rs.next()) list.add(mapToUser(rs));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

public List<Integer> getStaffIdsByDealer(int dealerId) throws ClassNotFoundException, SQLException {
    List<Integer> staffIds = new ArrayList<>();
    String sql = "SELECT user_id FROM UserAccount WHERE dealer_id = ?";
    try (Connection conn = DbUtils.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setInt(1, dealerId);
        ResultSet rs = ps.executeQuery();
        while (rs.next()) {
            staffIds.add(rs.getInt("user_id"));
        }
    }
    return staffIds;
}

}
