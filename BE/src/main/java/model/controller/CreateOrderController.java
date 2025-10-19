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
import java.util.Map;
import model.service.OrderService;
import utils.RequestUtils;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/createOrder")
public class CreateOrderController extends HttpServlet {

    private final OrderService service = new OrderService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(req);

            // Extract parameters, ensuring null checks before toString() if RequestUtils is inconsistent
            Object customerIdObj = params.get("customerId");
            String customerIdStr = (customerIdObj != null) ? customerIdObj.toString() : null;
            
            Object dealerStaffIdObj = params.get("dealerStaffId");
            String dealerStaffIdStr = (dealerStaffIdObj != null) ? dealerStaffIdObj.toString() : null;
            
            Object modelIdObj = params.get("modelId");
            String modelIdStr = (modelIdObj != null) ? modelIdObj.toString() : null;
            
            Object variantIdObj = params.get("variantId");
            String variantIdStr = (variantIdObj != null) ? variantIdObj.toString() : null;
            
            Object quantityObj = params.get("quantity");
            String quantityStr = (quantityObj != null) ? quantityObj.toString() : null;
            
            Object unitPriceObj = params.get("unitPrice");
            String unitPriceStr = (unitPriceObj != null) ? unitPriceObj.toString() : null;
            
            Object statusObj = params.get("status");
            String status = (statusObj != null) ? statusObj.toString() : null;
            
            Object isCustomObj = params.get("isCustom");
            String isCustomStr = (isCustomObj != null) ? isCustomObj.toString() : null;

            // Validate required fields
            if (customerIdStr == null || customerIdStr.trim().isEmpty() ||
                dealerStaffIdStr == null || dealerStaffIdStr.trim().isEmpty() ||
                modelIdStr == null || modelIdStr.trim().isEmpty() ||
                variantIdStr == null || variantIdStr.trim().isEmpty() ||
                quantityStr == null || quantityStr.trim().isEmpty() ||
                unitPriceStr == null || unitPriceStr.trim().isEmpty()) {
                ResponseUtils.error(resp, "Missing required parameters: customerId, dealerStaffId, modelId, variantId, quantity, unitPrice");
                return;
            }
            
            // Default 'status' if not provided (Handling null status case)
            if (status == null || status.trim().isEmpty()) {
                status = "Pending";
            }
            
            // Default 'isCustom' if not provided
            if (isCustomStr == null || isCustomStr.trim().isEmpty()) {
                 isCustomStr = "false"; 
            }

            // Convert String parameters to correct types
            int customerId = Integer.parseInt(customerIdStr);
            int dealerStaffId = Integer.parseInt(dealerStaffIdStr);
            int modelId = Integer.parseInt(modelIdStr);
            int variantId = Integer.parseInt(variantIdStr);
            int quantity = Integer.parseInt(quantityStr);
            double unitPrice = Double.parseDouble(unitPriceStr);
            boolean isCustom = Boolean.parseBoolean(isCustomStr);


            // Call service
            int orderId = service.HandlingCreateOrder(customerId, dealerStaffId, modelId,
                                                 status, variantId, quantity, unitPrice, isCustom);

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
}