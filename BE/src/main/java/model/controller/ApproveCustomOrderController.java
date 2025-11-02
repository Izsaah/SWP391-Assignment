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
import utils.JwtUtil;
import utils.RequestUtils;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/EVM/approveCustomOrder")
public class ApproveCustomOrderController extends HttpServlet {

    private final OrderService service = new OrderService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            // Extract token from header
            String token = JwtUtil.extractToken(req);
            int staffAdminId = JwtUtil.extractUserId(token); // get userId to store in staff_admin_id

            // Extract parameters from frontend
            Map<String, Object> params = RequestUtils.extractParams(req);

            Object orderIdObj = params.get("orderId");
            if (orderIdObj == null) {
                ResponseUtils.error(resp, "Missing required parameter: orderId");
                return;
            }
            int orderId = Integer.parseInt(orderIdObj.toString());

            String decision = params.get("decision") != null ? params.get("decision").toString() : "Pending"; // Agree / Disagree
            String versionName = params.get("versionName") != null ? params.get("versionName").toString() : "Custom Version";
            String color = params.get("color") != null ? params.get("color").toString() : "Default Color";
            double unitPrice = params.get("unitPrice") != null ? Double.parseDouble(params.get("unitPrice").toString()) : 0.0;

            // 3) Call service with staffAdminId
            boolean result = service.approveCustomOrderByOrderId(orderId, decision, versionName, color, unitPrice, staffAdminId);

            // 4) Send response
            if (result) {
                ResponseUtils.success(resp, "Custom order processed successfully", decision);
            } else {
                ResponseUtils.error(resp, "Failed to process custom order");
            }

        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid number format in parameters");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Error processing custom order: " + e.getMessage());
        }
    }
}
