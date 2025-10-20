package model.dao;

import java.sql.*;
import java.util.*;
import model.dto.PromotionDTO;
import utils.DbUtils;

public class DealerPromotionDAO {

    private static final String TABLE_NAME = "DealerPromotion";

    public List<PromotionDTO> getPromotionsByDealerId(int dealerId) throws ClassNotFoundException {
        List<PromotionDTO> promotions = new ArrayList<>();
        String sql
                = "SELECT p.promo_id, p.description, p.start_date, p.end_date, p.discount_rate, p.type FROM Promotion p JOIN DealerPromotion dp ON dp.promo_id = p.promo_id WHERE dp.dealer_id = ?";

        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, dealerId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                promotions.add(new PromotionDTO(
                        rs.getInt("promo_id"),
                        rs.getString("description"),
                        rs.getString("start_date"),
                        rs.getString("end_date"),
                        rs.getString("discount_rate"),
                        rs.getString("type")
                ));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return promotions;
    }

    public boolean createPromotionForDealer(int promoId, int dealerId) {
        String sql = "INSERT INTO " + TABLE_NAME + " (promo_id, dealer_id) VALUES (?, ?)";
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, promoId);
            ps.setInt(2, dealerId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Update a promotion for a dealer
    public boolean updatePromotionForDealer(int promoId, int dealerId, int newPromoId) {
        String sql = "UPDATE " + TABLE_NAME + " SET promo_id = ? WHERE promo_id = ? AND dealer_id = ?";
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, newPromoId);
            ps.setInt(2, promoId);
            ps.setInt(3, dealerId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Map<String, Object>> getPromotionDealerCount() {
        String sql = "SELECT promo_id, COUNT(dealer_id) AS dealer_count FROM " + TABLE_NAME + " GROUP BY promo_id";
        List<Map<String, Object>> result = new ArrayList<>();
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("promoId", rs.getInt("promo_id"));
                row.put("dealerCount", rs.getInt("dealer_count"));
                result.add(row);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
}
