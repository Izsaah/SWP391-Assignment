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
        System.out.println("DEBUG OrderDAO.retrieve: SQL = " + sql);
        System.out.println("DEBUG OrderDAO.retrieve: Parameters count = " + params.length);
        for (int i = 0; i < params.length; i++) {
            System.out.println("DEBUG OrderDAO.retrieve: Parameter[" + i + "] = " + params[i] + " (type: " + (params[i] != null ? params[i].getClass().getName() : "null") + ")");
        }
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            ResultSet rs = ps.executeQuery();
            List<OrderDTO> list = new ArrayList<>();
            int rowCount = 0;
            while (rs.next()) {
                rowCount++;
                try {
                    OrderDTO order = mapToOrder(rs);
                    list.add(order);
                    System.out.println("DEBUG OrderDAO.retrieve: Mapped order ID = " + order.getOrderId() + ", customerId = " + order.getCustomerId());
                } catch (SQLException e) {
                    System.err.println("DEBUG OrderDAO.retrieve: Error mapping row " + rowCount + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
            System.out.println("DEBUG OrderDAO.retrieve: Total rows processed = " + rowCount + ", list size = " + list.size());
            return list;
        } catch (SQLException e) {
            System.err.println("DEBUG OrderDAO.retrieve: SQLException occurred: " + e.getMessage());
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            System.err.println("DEBUG OrderDAO.retrieve: Unexpected exception: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
public int create(Connection conn, OrderDTO order) throws SQLException {
        try ( PreparedStatement ps = conn.prepareStatement(INSERT_ORDER, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, order.getCustomerId());
            ps.setInt(2, order.getDealerStaffId());
            ps.setInt(3, order.getModelId());
            ps.setString(4, order.getOrderDate());
            ps.setString(5, order.getStatus());

            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating order failed, no rows affected.");
            }

            try ( ResultSet generatedKeys = ps.getGeneratedKeys()) {
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
        System.out.println("DEBUG OrderDAO.getByCustomerId: Querying for customerId = " + customerId);
        List<OrderDTO> result = retrieve("customer_id=?", customerId);
        System.out.println("DEBUG OrderDAO.getByCustomerId: Found " + (result != null ? result.size() : "null") + " orders for customerId = " + customerId);
        if (result != null && !result.isEmpty()) {
            for (OrderDTO order : result) {
                System.out.println("DEBUG OrderDAO.getByCustomerId: Order ID = " + order.getOrderId() + ", status = " + order.getStatus());
            }
        }
        return result;
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
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {

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

    public int countOrdersByDealerStaffId(int dealerStaffId) throws ClassNotFoundException, SQLException {
        List<OrderDTO> list = retrieve("dealer_staff_id = ?", dealerStaffId);
        return list.size();
    }

    public boolean deleteById(Connection conn, int orderId) throws SQLException {
        String sql = "DELETE FROM [Order] WHERE order_id = ?";
        try ( PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, orderId);
            int rows = ps.executeUpdate();
            return rows > 0;
        }
    }

    public boolean updateStatus(int orderId, String newStatus) throws SQLException, ClassNotFoundException {
        String sql = "UPDATE [Order] SET status = ? WHERE order_id = ?";
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, newStatus);
            ps.setInt(2, orderId);
            return ps.executeUpdate() > 0;
        }
    }
    
    public List<java.util.Map<String, Object>> retrieveOrdersWithConfirmedDetails(int orderDetailId)
            throws SQLException, ClassNotFoundException {
        String sql = "SELECT o.order_id, o.customer_id, o.dealer_staff_id, o.model_id, o.order_date, o.status, "
                + "d.order_detail_id, d.serial_id, d.quantity, d.unit_price "
                + "FROM [Order] o "
                + "JOIN OrderDetail d ON o.order_id = d.order_id "
                + "WHERE EXISTS (SELECT 1 FROM Confirmation c WHERE c.order_detail_id = d.order_detail_id) "
                + "AND d.order_detail_id = ?";

        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, orderDetailId);
            ResultSet rs = ps.executeQuery();

            List<java.util.Map<String, Object>> list = new ArrayList<>();

            while (rs.next()) {
                java.util.Map<String, Object> row = new java.util.HashMap<>();

                // Order info
                row.put("order_id", rs.getInt("order_id"));
                row.put("customer_id", rs.getInt("customer_id"));
                row.put("dealer_staff_id", rs.getInt("dealer_staff_id"));
                row.put("model_id", rs.getInt("model_id"));
                row.put("order_date", rs.getString("order_date"));
                row.put("status", rs.getString("status"));

                // Order detail info
                row.put("order_detail_id", rs.getInt("order_detail_id"));
                row.put("serial_id", rs.getString("serial_id"));
                row.put("quantity", rs.getInt("quantity"));
                row.put("unit_price", rs.getDouble("unit_price"));

                list.add(row);
            }

            return list;
        }
    }
    
}