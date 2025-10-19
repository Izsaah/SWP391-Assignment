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
import model.dto.PromotionDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class PromotionDAO {
    private static final String TABLE_NAME = "Promotion";

    private PromotionDTO mapToPromotion(ResultSet rs) throws SQLException {
        return new PromotionDTO(
            rs.getInt("promo_id"),
            rs.getString("description"),
            rs.getString("start_date"),
            rs.getString("end_date"),
            rs.getString("discount_rate"),
            rs.getString("type")
        );
    }

    public List<PromotionDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<PromotionDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToPromotion(rs));
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
  public List<PromotionDTO> GetAllPromotion(int id) {
    return retrieve("promo_id = ?", id);
}
}
