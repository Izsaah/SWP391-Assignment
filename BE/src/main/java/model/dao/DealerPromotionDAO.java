package model.dao;

import java.sql.*;
import java.util.*;
import model.dto.PromotionDTO;
import utils.DbUtils;

public class DealerPromotionDAO {

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
}
