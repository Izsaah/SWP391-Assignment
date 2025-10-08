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
import model.service.CreateOrderService;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/createOrder")
public class CreateOrderController extends HttpServlet {

    private final CreateOrderService service = new CreateOrderService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            // Parse parameters manually
            int customerId = parseInt(req.getParameter("customerId"));
            int dealerId = parseInt(req.getParameter("dealerId"));
            int dealerStaffId = parseInt(req.getParameter("dealerStaffId"));
            int variantId = parseInt(req.getParameter("variantId"));
            int quantity = parseInt(req.getParameter("quantity"));
            double unitPrice = parseDouble(req.getParameter("unitPrice"));
            String status = "Pending";

            // Validate required fields
            if (status == null || status.trim().isEmpty()) {
                ResponseUtils.error(resp, "Missing required parameters");
                return;
            }

            // Call service
            int orderId = service.HandlingCreateOrder(customerId, dealerId, dealerStaffId,
                                             status, variantId, quantity, unitPrice);

            if (orderId > 0) {
                ResponseUtils.success(resp, "Order created successfully", "Order ID: " + orderId);
            } else {
                ResponseUtils.error(resp, "Failed to create order");
            }

        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid number format in parameters");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Error creating order: " + e.getMessage());
        }
    }

    private int parseInt(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new NumberFormatException();
        }
        return Integer.parseInt(value.trim());
    }

    private double parseDouble(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new NumberFormatException();
        }
        return Double.parseDouble(value.trim());
    }

}
