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
import java.util.Map;
import model.service.PaymentService;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/viewCustomerWithActiveInstallments")
public class ViewCustomerWithActiveInstallmentsController extends HttpServlet {

    private final PaymentService paymentService = new PaymentService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            List<Map<String, Object>> customers = paymentService.getCustomersWithActiveInstallments();

            if (customers == null || customers.isEmpty()) {
                // Only send the "No customers" response if the list is empty
                ResponseUtils.success(response, "No customers with active or overdue installments found", Collections.emptyList());
            } else {
                // Only send the "retrieved successfully" response if the list has data
                ResponseUtils.success(response, "Active installment customers retrieved successfully", customers);
            }

            // !!! IMPORTANT: The redundant line below is removed !!!
            // ResponseUtils.success(response, "Active installment customers retrieved successfully", customers);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Failed to retrieve active installment customers: " + e.getMessage());
        }
    }
}
