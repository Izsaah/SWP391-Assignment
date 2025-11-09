/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import model.dto.CustomerDTO;
import model.service.CustomerService;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/viewAllCustomer")
public class ViewAllCustomerController extends HttpServlet {

    private final CustomerService service = new CustomerService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            List<CustomerDTO> lists = service.getAll();
            
            // Handle null or empty lists
            if (lists == null) {
                lists = new ArrayList<>();
            }
            
            // Convert CustomerDTO to simple Map to avoid serialization issues with nested objects
            List<Map<String, Object>> customerList = new ArrayList<>();
            for (CustomerDTO customer : lists) {
                if (customer != null) {
                    Map<String, Object> customerMap = new LinkedHashMap<>();
                    customerMap.put("customerId", customer.getCustomerId());
                    customerMap.put("customer_id", customer.getCustomerId()); // Also include for compatibility
                    customerMap.put("name", customer.getName());
                    customerMap.put("address", customer.getAddress());
                    customerMap.put("email", customer.getEmail());
                    customerMap.put("phoneNumber", customer.getPhoneNumber());
                    customerMap.put("phone_number", customer.getPhoneNumber()); // Also include for compatibility
                    customerList.add(customerMap);
                }
            }
            
            // Return success response with the list (even if empty)
            ResponseUtils.success(response, "All customers retrieved successfully", customerList);
        } catch (Exception e) {
            e.printStackTrace();
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.isEmpty()) {
                errorMessage = "Error: " + e.getClass().getSimpleName();
                if (e.getCause() != null) {
                    errorMessage += " - " + e.getCause().getMessage();
                }
            }
            ResponseUtils.error(response, "Internal server error: " + errorMessage);
        }
    }
}