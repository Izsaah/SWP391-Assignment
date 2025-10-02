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
import model.dto.SaleRecordDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class SaleRecordDAO {
    private static final String TABLE_NAME = "SaleRecord";

    private SaleRecordDTO mapToSaleRecord(ResultSet rs) throws SQLException {
        return new SaleRecordDTO(
            rs.getInt("sale_id"),
            rs.getInt("customer_id"),
            rs.getInt("dealer_id"),
            rs.getInt("dealer_staff_id"),
            rs.getString("sale_date"),
            rs.getDouble("sale_amount")
        );
    }
    
    public List<SaleRecordDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<SaleRecordDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToSaleRecord(rs));
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
