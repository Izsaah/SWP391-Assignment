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
import model.dto.InventoryDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class InventoryDAO {

    private static final String TABLE_NAME = "Inventory";

    private InventoryDTO mapToInventory(ResultSet rs) throws SQLException {
        return new InventoryDTO(
                rs.getInt("inventory_id"),
                rs.getInt("model_id"),
                rs.getString("quantity")
        );
    }

    public List<InventoryDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            ResultSet rs = ps.executeQuery();
            List<InventoryDTO> list = new ArrayList<>();
            while (rs.next()) {
                list.add(mapToInventory(rs));
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<InventoryDTO> viewAllInventory() {
        return retrieve("1 = 1");
    }

    public List<InventoryDTO> getInventoryByModelId(int id) {
        return retrieve("model_id = ?", id);
    }
}
