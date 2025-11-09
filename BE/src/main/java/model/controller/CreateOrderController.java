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
import model.dao.VehicleVariantDAO;
import model.dto.VehicleVariantDTO;
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
    private final VehicleVariantDAO variantDAO = new VehicleVariantDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(req);

            // Validate required fields
            if (!params.containsKey("customerId") || !params.containsKey("dealerstaffId")
                    || !params.containsKey("modelId") || !params.containsKey("quantity")) {
                ResponseUtils.error(resp, "Missing required parameters: customerId, dealerstaffId, modelId, quantity");
                return;
            }

            // Parse required parameters
            int customerId = Integer.parseInt(params.get("customerId").toString());
            int dealerstaffId = Integer.parseInt(params.get("dealerstaffId").toString());
            int modelId = Integer.parseInt(params.get("modelId").toString());
            int quantity = Integer.parseInt(params.get("quantity").toString());

            // Validate quantity
            if (quantity <= 0) {
                ResponseUtils.error(resp, "Quantity must be greater than 0");
                return;
            }

            // Handle variantId - optional
            Integer variantId = null;
            double unitPrice = 0.0;

            // First, try to get unitPrice from request (frontend sends basePrice/totalPrice)
            if (params.containsKey("unitPrice") && params.get("unitPrice") != null) {
                try {
                    unitPrice = Double.parseDouble(params.get("unitPrice").toString());
                } catch (NumberFormatException e) {
                    // Ignore, will try other methods
                }
            } else if (params.containsKey("basePrice") && params.get("basePrice") != null) {
                try {
                    unitPrice = Double.parseDouble(params.get("basePrice").toString());
                } catch (NumberFormatException e) {
                    // Ignore, will try other methods
                }
} else if (params.containsKey("totalPrice") && params.get("totalPrice") != null) {
                try {
                    // If totalPrice is provided, divide by quantity to get unit price
                    double totalPrice = Double.parseDouble(params.get("totalPrice").toString());
                    unitPrice = totalPrice / quantity;
                } catch (NumberFormatException e) {
                    // Ignore, will try other methods
                }
            }

            if (params.containsKey("variantId") && params.get("variantId") != null
                    && !params.get("variantId").toString().trim().isEmpty()) {
                variantId = Integer.parseInt(params.get("variantId").toString());

                if (variantId > 0) {
                    VehicleVariantDTO variant = variantDAO.findUnitPriceByVariantId(variantId);
                    if (variant == null) {
                        ResponseUtils.error(resp, "Variant not found with ID: " + variantId);
                        return;
                    }
                    // Use variant price if no price was provided from frontend, or if variant price is higher
                    if (unitPrice <= 0 || variant.getPrice() > 0) {
                        unitPrice = variant.getPrice();
                    }
                }
            }

            // Handle status - optional, defaults to "Pending"
            String status = "Pending";
            if (params.containsKey("status") && params.get("status") != null
                    && !params.get("status").toString().trim().isEmpty()) {
                status = params.get("status").toString();
            }

            // Handle isCustom - optional, defaults to false
            boolean isCustom = params.containsKey("isCustom") && params.get("isCustom") != null
                    ? Boolean.parseBoolean(params.get("isCustom").toString())
                    : false;

            // Create order via service
            int orderId = service.HandlingCreateOrder(customerId, dealerstaffId, modelId,
                    status, variantId, quantity, unitPrice, isCustom);

            // Return response
            if (orderId > 0) {
                String message = String.format(
                        "Order ID: %d | Variant: %s | Unit Price: %.2f%s",
                        orderId,
                        variantId != null && variantId > 0 ? variantId : "Auto-Generated",
                        unitPrice,
                        isCustom ? " | Status: Custom (Pending Confirmation)" : ""
                );
                ResponseUtils.success(resp, "Order created successfully", message);
            } else {
                ResponseUtils.error(resp, "Failed to create order");
            }

        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid number format: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
ResponseUtils.error(resp, "Error creating order: " + e.getMessage());
        }
    }
}