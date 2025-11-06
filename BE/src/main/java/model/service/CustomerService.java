/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.sql.Connection;
import java.sql.SQLException;
import model.dao.CustomerDAO;
import model.dto.CustomerDTO;
import utils.DbUtils;
import java.util.Collections;
import java.util.List;

/**
 *
 * @author Admin
 */
public class CustomerService {
    private CustomerDAO customerDAO = new CustomerDAO();
    
    public int HandlingCreateCustomer(String name, String address, String email, String phoneNumber){
        Connection conn = null;
        try {
            conn = DbUtils.getConnection();
            conn.setAutoCommit(false);

            // Validate inputs
            if (name == null || name.trim().isEmpty()) throw new IllegalArgumentException("Name is required");
            if (email == null || email.trim().isEmpty()) throw new IllegalArgumentException("Email is required");

            CustomerDTO customer = new CustomerDTO();
            customer.setName(name);
            customer.setAddress(address);
            customer.setEmail(email);
            customer.setPhoneNumber(phoneNumber);

            int customerId = customerDAO.create(conn, customer);
            if (customerId <= 0) throw new SQLException("Failed to create customer");

            conn.commit();
            return customerId;

        } catch (Exception e) {
            e.printStackTrace();
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { ex.printStackTrace(); }
            }
            return -1;
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException e) { e.printStackTrace(); }
            }
        }
    }
    public List<CustomerDTO> getAllCustomers() {
        try {
            List<CustomerDTO> customers = customerDAO.getAllCustomers();
            if (customers == null || customers.isEmpty()) {
                return Collections.emptyList();
            }
            return customers;
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}
