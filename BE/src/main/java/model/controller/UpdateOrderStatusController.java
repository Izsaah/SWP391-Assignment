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
import java.sql.SQLException;
import java.util.Map;
import model.service.OrderService;
import utils.JwtUtil;
import utils.RequestUtils;
import utils.ResponseUtils;

/**
 *
 * @author khoac
 */
@WebServlet("/api/staff/updateOrderStatuss")
public class UpdateOrderStatusController extends HttpServlet {

    private final OrderService orderService = new OrderService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        try {
            // Extract and validate JWT token
            // This validates that the request has a valid, non-expired token
            String token = JwtUtil.extractToken(req);
            @SuppressWarnings("unused")
            int dealerStaffId = JwtUtil.extractUserId(token); // Validate token contains userId
            
            // Lấy param từ JSON hoặc Form
            Map<String, Object> params = RequestUtils.extractParams(req);

            Object idObj = params.get("order_id");
            Object statusObj = params.get("status");

            if (idObj == null || statusObj == null) {
                ResponseUtils.error(resp, "Missing order_id or status!");
                return;
            }

            int orderId = Integer.parseInt(idObj.toString());
            String newStatus = statusObj.toString();

            boolean updated = orderService.updateOrderStatus(orderId, newStatus);

            if (updated) {
                ResponseUtils.success(resp, "Update status successfully!", null);
            } else {
                ResponseUtils.error(resp, "Update not successfully!");
            }

        } catch (utils.AuthException e) {
            // Handle authentication errors (invalid or expired token)
            ResponseUtils.error(resp, "Authentication failed: " + e.getMessage());
        } catch (NumberFormatException ex) {
            ResponseUtils.error(resp, "Invalid order_id format. Must be a number.");
        } catch (IllegalArgumentException ex) {
            ResponseUtils.error(resp, ex.getMessage());
        } catch (SQLException | ClassNotFoundException ex) {
            ex.printStackTrace();
            ResponseUtils.error(resp, "Error while updating: " + ex.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Internal server error: " + e.getMessage());
        }
    }
}
