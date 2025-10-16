/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import model.dto.PaymentDTO;
import utils.DbUtils;

/**
 *
 * @author Admin
 */
public class PaymentDAO {

    private static final String TABLE_NAME = "Payment";

    private PaymentDTO mapToPayment(ResultSet rs) throws SQLException {
        return new PaymentDTO(
                rs.getInt("order_id"),
                rs.getString("method"),
                rs.getDouble("amount"),
                rs.getString("payment_date")
        );
    }

    public List<PaymentDTO> retrieve(String condition, Object... params) {
        String sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + condition;
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            ResultSet rs = ps.executeQuery();
            List<PaymentDTO> list = new ArrayList<>();
            while (rs.next()) {
                list.add(mapToPayment(rs));
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
<<<<<<< Updated upstream
=======
    
    public boolean create(PaymentDTO payment) throws ClassNotFoundException {
        if (payment.getMethod()== null || payment.getMethod().isEmpty()) {
            payment.setMethod("TT");
        }

        String sql = "INSERT INTO " + TABLE_NAME + " (order_id, amount, payment_date, method) VALUES (?, ?, ?, ?)";
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, payment.getOrderId());
            ps.setDouble(2, payment.getAmount());
            ps.setString(3, payment.getPaymentDate());
            ps.setString(4, payment.getMethod());

            int rows = ps.executeUpdate();

            if (rows > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    payment.setPaymentId(rs.getInt(1));
                }
                return true;
            }
        } catch (SQLException e) {
            System.out.println("Error creating payment: " + e.getMessage());
        }
        return false;
    }
     public PaymentDTO findPaymentById(int paymentId){
        List<PaymentDTO> list = retrieve("payment_id = ?", paymentId);
        return list.get(0);
    }
    public List<PaymentDTO> getPayMentsByOrderId(int OrderId){
    return retrieve("order_id=?", OrderId);
    }
      public List<PaymentDTO> getAllPayment(){
        return retrieve("1 = 1");
    }
>>>>>>> Stashed changes

    public boolean create(PaymentDTO payment) throws ClassNotFoundException {
        if (payment.getMethod()== null || payment.getMethod().isEmpty()) {
            payment.setMethod("TT");
        }

        String sql = "INSERT INTO " + TABLE_NAME + " (order_id, amount, payment_date, method) VALUES (?, ?, ?, ?)";
        try ( Connection conn = DbUtils.getConnection();  PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, payment.getOrderId());
            ps.setDouble(2, payment.getAmount());
            ps.setString(3, payment.getPaymentDate());
            ps.setString(4, payment.getMethod());

            int rows = ps.executeUpdate();

            if (rows > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    payment.setPaymentId(rs.getInt(1));
                }
                return true;
            }
        } catch (SQLException e) {
            System.out.println("Error creating payment: " + e.getMessage());
        }
        return false;
    }
    
    public List<PaymentDTO> getAllPayment(){
        return retrieve("1 = 1");
    }
    
    public PaymentDTO findPaymentById(int paymentId){
        List<PaymentDTO> list = retrieve("payment_id = ?", paymentId);
        return list.get(0);
    }
    
    public List<PaymentDTO> findPaymentByOrderId(int orderId){
        return retrieve("order_id = ?", orderId);
    }
    
}
