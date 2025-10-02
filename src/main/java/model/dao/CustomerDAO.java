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
import model.dto.CustomerDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class CustomerDAO {
    private static final String TABLE_NAME = "Customer";

    private CustomerDTO mapToCustomer(ResultSet rs) throws SQLException {
        return new CustomerDTO(
            rs.getInt("customer_id"),
            rs.getString("name"),
            rs.getString("address"),
            rs.getString("email"),
            rs.getString("phone_number")
        );
    }

    public List<CustomerDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<CustomerDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToCustomer(rs));
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
