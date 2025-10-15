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
import model.dto.InstallmentPlanDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class InstallmentPlanDAO {
    private static final String TABLE_NAME = "InstallmentPlan";
    
    private InstallmentPlanDTO mapToInstallmentPlan(ResultSet rs) throws SQLException {
        return new InstallmentPlanDTO(
            rs.getInt("plan_id"),
            rs.getInt("payment_id"),
            rs.getString("interest_rate"),
            rs.getString("term_month"),
            rs.getString("monthly_rate"),
            rs.getString("status")
        );
    }
    
    public List<InstallmentPlanDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            ResultSet rs = ps.executeQuery();
            List<InstallmentPlanDTO> list = new ArrayList<>();
            while (rs.next()) list.add(mapToInstallmentPlan(rs));
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    public List<InstallmentPlanDTO> getInstallmentPlansListByPayMentId(int paymentId){
    return retrieve("payment_id=?", paymentId);
    }
}
