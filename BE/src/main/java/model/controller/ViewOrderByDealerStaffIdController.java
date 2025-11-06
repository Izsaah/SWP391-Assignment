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
import java.util.List;
import model.dto.OrderDTO;
import model.service.OrderService;
import utils.JwtUtil;
import utils.ResponseUtils;


/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/viewOrdersByStaffId")
public class ViewOrderByDealerStaffIdController extends HttpServlet {
    
    private final OrderService orderService = new OrderService();
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            // Extract token and get dealerStaffId from JWT
            String token = JwtUtil.extractToken(req);
            int dealerStaffId = JwtUtil.extractUserId(token);
            
            // Call the service to retrieve the list of orders
            List<OrderDTO> orderList = orderService.GetListOrderByDealerStaffId(dealerStaffId);
            
            if (orderList != null && !orderList.isEmpty()) {
                ResponseUtils.success(resp, "Orders found successfully", orderList);
            } else if (orderList != null) {
                // If the list is empty but retrieval succeeded (Collections.emptyList())
                ResponseUtils.success(resp, "No orders found for dealer staff ID: " + dealerStaffId, orderList);
            } else {
                // Should ideally not happen if service returns Collections.emptyList() on failure
                ResponseUtils.error(resp, "Failed to retrieve orders");
            }
            
        } catch (utils.AuthException e) {
            // Handle authentication errors (missing/invalid token)
            ResponseUtils.error(resp, "Authentication failed: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "An unexpected error occurred while viewing orders: " + e.getMessage());
        }
    }
}
