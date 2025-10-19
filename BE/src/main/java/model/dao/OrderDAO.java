package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import model.dto.OrderDTO;
import utils.DbUtils;

public class OrderDAO {

    private static final String TABLE_NAME = "[Order]";
    private static final String INSERT_ORDER = "INSERT INTO " + TABLE_NAME
            + " (customer_id, dealer_staff_id, model_id, order_date, status) VALUES (?, ?, ?, ?, ?)";

    private OrderDTO mapToOrder(ResultSet rs) throws SQLException {
        return new OrderDTO(
                rs.getInt("order_id"),
                rs.getInt("customer_id"),
                rs.getInt("dealer_staff_id"),
                rs.getInt("model_id"),
                rs.getString("order_date"),
                rs.getString("status")
        );
    }

    public List<OrderDTO> retrieve(String condition, Object... params) throws SQLException, ClassNotFoundException {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try (Connection conn = DbUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            ResultSet rs = ps.executeQuery();
            List<OrderDTO> list = new ArrayList<>();
            while (rs.next()) {
                list.add(mapToOrder(rs));
            }
            return list;
        }
    }

    public int create(Connection conn, OrderDTO order) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(INSERT_ORDER, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, order.getCustomerId());
            ps.setInt(2, order.getDealerStaffId());
            ps.setInt(3, order.getModelId());
            ps.setString(4, order.getOrderDate());
            ps.setString(5, order.getStatus());

            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating order failed, no rows affected.");
            }

            try (ResultSet generatedKeys = ps.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    return generatedKeys.getInt(1);
                } else {
                    throw new SQLException("Creating order failed, no ID obtained.");
                }
            }
        }
    }

    public OrderDTO getById(int orderId) throws SQLException, ClassNotFoundException {
        List<OrderDTO> orders = retrieve("order_id = ?", orderId);
        if (orders != null && !orders.isEmpty()) {
            return orders.get(0);
        }
        return null;
    }

    public List<OrderDTO> getByStaffId(int dealerStaffId) throws SQLException, ClassNotFoundException {
        return retrieve("dealer_staff_id=?", dealerStaffId);
    }

    public List<OrderDTO> getByCustomerId(int customerId) throws SQLException, ClassNotFoundException {
        return retrieve("customer_id=?", customerId);
    }

    public List<OrderDTO> getOrdersByDealerStaffIds(List<Integer> staffIds) throws ClassNotFoundException, SQLException {
        List<OrderDTO> orders = new ArrayList<>();
        if (staffIds == null || staffIds.isEmpty()) {
            return orders;
        }

        StringBuilder inClause = new StringBuilder();
        for (int i = 0; i < staffIds.size(); i++) {
            inClause.append("?");
            if (i < staffIds.size() - 1) {
                inClause.append(",");
            }
        }

        String sql = "SELECT * FROM [Order] WHERE dealer_staff_id IN (" + inClause + ")";
        try (Connection conn = DbUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (int i = 0; i < staffIds.size(); i++) {
                ps.setInt(i + 1, staffIds.get(i));
            }

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                orders.add(mapToOrder(rs));
            }
        }
        return orders;
    }
}