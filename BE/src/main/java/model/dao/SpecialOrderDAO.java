package model.dao;

import model.dto.SpecialOrderDTO;
import utils.DbUtils;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SpecialOrderDAO {

    private static final String TABLE_NAME = "SpecialOrder";

    private SpecialOrderDTO mapToSpecialOrder(ResultSet rs) throws SQLException {
        return new SpecialOrderDTO(
                rs.getInt("special_order_id"),
                rs.getInt("customer_id"),
                rs.getInt("dealer_staff_id"),
                rs.getInt("dealer_id"),
                rs.getInt("model_id"),
                rs.getString("order_date"),
                rs.getString("description"),
                rs.getString("quantity")
        );
    }

    public List<SpecialOrderDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        List<SpecialOrderDTO> list = new ArrayList<>();

        try (Connection conn = DbUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapToSpecialOrder(rs));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    public SpecialOrderDTO insert(SpecialOrderDTO order) {
        String sql = "INSERT INTO " + TABLE_NAME
                + " (customer_id, dealer_staff_id, dealer_id, model_id, order_date, description, quantity) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DbUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, order.getCustomerId());
            ps.setInt(2, order.getDealerStaffId());
            ps.setInt(3, order.getDealerId());
            ps.setInt(4, order.getModelId());
            ps.setString(5, order.getOrderDate());
            ps.setString(6, order.getDescription());
            ps.setString(7, order.getQuantity());

            if (ps.executeUpdate() > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        order.setSpecialOrderId(rs.getInt(1));
                    }
                }
                return order;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public boolean update(SpecialOrderDTO order) {
        String sql = "UPDATE " + TABLE_NAME + " SET "
                + "customer_id = ?, "
                + "dealer_staff_id = ?, "
                + "dealer_id = ?, "
                + "model_id = ?, "
                + "order_date = ?, "
                + "description = ?, "
                + "quantity = ? "
                + "WHERE special_order_id = ?";

        try (Connection conn = DbUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, order.getCustomerId());
            ps.setInt(2, order.getDealerStaffId());
            ps.setInt(3, order.getDealerId());
            ps.setInt(4, order.getModelId());
            ps.setString(5, order.getOrderDate());
            ps.setString(6, order.getDescription());
            ps.setString(7, order.getQuantity());
            ps.setInt(8, order.getSpecialOrderId());

            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }
    public SpecialOrderDTO getSpecialOrderBySpecialId(int id){
    return retrieve("special_order_id=?", id).get(0);
    }
}
