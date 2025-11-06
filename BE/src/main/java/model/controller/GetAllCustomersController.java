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
import java.util.Collections;
import java.util.List;
import model.dto.CustomerDTO;
import model.service.CustomerService;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/getAllCustomers")
public class GetAllCustomersController extends HttpServlet {

    private final CustomerService service = new CustomerService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            List<CustomerDTO> customers = service.getAllCustomers();

            if (customers == null || customers.isEmpty()) {
                ResponseUtils.success(resp, "No customers found", Collections.emptyList());
            } else {
                ResponseUtils.success(resp, "Customers retrieved successfully", customers);
            }

        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Error retrieving customers: " + e.getMessage());
        }
    }
}