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
import model.dto.UserAccountDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class UserAccountDAO {
    private static final String TABLE_NAME = "User";

    private UserAccountDTO mapToUser(ResultSet rs) throws SQLException {
        return new UserAccountDTO(
            rs.getInt("user_id"),
            rs.getInt("customer_id"),
            rs.getInt("dealer_id"),
            rs.getString("password"),
            rs.getString("email"),
            rs.getString("username"),
            rs.getString("phone_number")
        );
    }

    public List<UserAccountDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
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
    
    public UserAccountDTO login(String username ,String password){
          List<UserAccountDTO> users = retrieve("username = ? AND password = ?", username, password);
         return users.get(0);
    }
}
