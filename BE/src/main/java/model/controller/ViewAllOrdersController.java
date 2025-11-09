package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import model.dao.CustomerDAO;
import model.dao.UserAccountDAO;
import model.dao.VehicleModelDAO;
import model.dto.CustomerDTO;
import model.dto.OrderDTO;
import model.dto.OrderDetailDTO;
import model.dto.UserAccountDTO;
import model.dto.VehicleModelDTO;
import model.service.OrderService;
import utils.JwtUtil;
import utils.ResponseUtils;

/**
 * Controller for manager to view all orders from all staff in the dealer
 */
@WebServlet("/api/manager/viewAllOrders")
public class ViewAllOrdersController extends HttpServlet {

    private final OrderService orderService = new OrderService();
    private final CustomerDAO customerDAO = new CustomerDAO();
    private final UserAccountDAO userAccountDAO = new UserAccountDAO();
    private final VehicleModelDAO vehicleModelDAO = new VehicleModelDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            // Extract token and get userId from JWT
            String token = JwtUtil.extractToken(request);
            int userId = JwtUtil.extractUserId(token);
            
            // Get user account to retrieve dealerId
            UserAccountDTO user = userAccountDAO.getUserById(userId);
            if (user == null) {
                ResponseUtils.error(response, "User not found");
                return;
            }
            
            int dealerId = user.getDealerId();
            if (dealerId <= 0) {
                ResponseUtils.error(response, "Invalid dealer ID for user");
                return;
            }
            
            System.out.println("INFO: ViewAllOrdersController - userId: " + userId + ", dealerId: " + dealerId);
            
            // Get all orders from all staff in dealer
            List<OrderDTO> orders = orderService.getAllOrdersByDealer(dealerId);
            
            System.out.println("INFO: ViewAllOrdersController - Orders retrieved: " + (orders != null ? orders.size() : 0));
            
            if (orders == null || orders.isEmpty()) {
                ResponseUtils.success(response, "No orders found", Collections.emptyList());
                return;
            }
            
            // Transform orders to enriched format for frontend
            // IMPORTANT: Include ALL orders regardless of status, detail, or any condition
            List<Map<String, Object>> enrichedOrders = new ArrayList<>();
            
            System.out.println("INFO: ViewAllOrdersController - Starting to enrich " + orders.size() + " orders");
            
            for (OrderDTO order : orders) {
                try {
                    Map<String, Object> orderMap = new LinkedHashMap<>();
                    
                    // Basic order information - include ALL orders
                    orderMap.put("orderId", order.getOrderId());
                    orderMap.put("orderDate", order.getOrderDate());
                    // Include order even if status is null - default to null, frontend will handle
                    orderMap.put("status", order.getStatus() != null ? order.getStatus() : "Pending");
                    orderMap.put("dealerStaffId", order.getDealerStaffId());
                    orderMap.put("modelId", order.getModelId());
                    orderMap.put("isCustom", order.isIsCustom());
                    
                    // Get customer information
                    List<CustomerDTO> customerList = customerDAO.findById(order.getCustomerId());
                    if (customerList != null && !customerList.isEmpty()) {
                        CustomerDTO customer = customerList.get(0);
                        orderMap.put("customerId", customer.getCustomerId());
                        orderMap.put("customerName", customer.getName());
                        orderMap.put("customerEmail", customer.getEmail());
                        orderMap.put("customerPhone", customer.getPhoneNumber());
                        orderMap.put("customerAddress", customer.getAddress());
                    } else {
                        orderMap.put("customerId", order.getCustomerId());
                        orderMap.put("customerName", "Unknown Customer");
                        orderMap.put("customerEmail", "");
                        orderMap.put("customerPhone", "");
                        orderMap.put("customerAddress", "");
                    }
                    
                    // Get staff information
                    UserAccountDTO staff = userAccountDAO.getUserById(order.getDealerStaffId());
                    if (staff != null) {
                        orderMap.put("salespersonName", staff.getUsername());
                        orderMap.put("salespersonId", staff.getUserId());
                    } else {
                        orderMap.put("salespersonName", "Unknown Staff");
                        orderMap.put("salespersonId", order.getDealerStaffId());
                    }
                    
                    // Get vehicle information
                    if (order.getModelId() > 0) {
                        List<VehicleModelDTO> models = vehicleModelDAO.retrieve("model_id = ?", order.getModelId());
                        if (models != null && !models.isEmpty()) {
                            orderMap.put("vehicleName", models.get(0).getModelName());
                        } else {
                            orderMap.put("vehicleName", "Model " + order.getModelId());
                        }
                    } else {
                        orderMap.put("vehicleName", "Unknown Vehicle");
                    }
                    
                    // Get order detail information
                    OrderDetailDTO detail = order.getDetail();
                    if (detail != null) {
                        orderMap.put("orderDetailId", detail.getOrderDetailId());
                        orderMap.put("serialId", detail.getSerialId());
                        orderMap.put("quantity", detail.getQuantity());
                        orderMap.put("unitPrice", detail.getUnitPrice());
                        
                        // Calculate total amount
                        try {
                            int qty = Integer.parseInt(detail.getQuantity());
                            double totalAmount = detail.getUnitPrice() * qty;
                            orderMap.put("amount", totalAmount);
                        } catch (NumberFormatException e) {
                            orderMap.put("amount", detail.getUnitPrice());
                        }
                    } else {
                        orderMap.put("orderDetailId", null);
                        orderMap.put("serialId", null);
                        orderMap.put("quantity", "1");
                        orderMap.put("unitPrice", 0.0);
                        orderMap.put("amount", 0.0);
                    }
                    
                    // Get confirmation information (for special orders)
                    if (order.getConfirmation() != null) {
                        orderMap.put("confirmationId", order.getConfirmation().getConfirmationId());
                        orderMap.put("agreement", order.getConfirmation().getAgreement());
                        orderMap.put("confirmationDateTime", order.getConfirmation().getDate());
                        orderMap.put("flaggedForCompany", true);
                    } else {
                        orderMap.put("confirmationId", null);
                        orderMap.put("agreement", null);
                        orderMap.put("confirmationDateTime", null);
                        orderMap.put("flaggedForCompany", false);
                    }
                    
                    enrichedOrders.add(orderMap);
                } catch (Exception e) {
                    // Even if enrichment fails for one order, continue with others
                    System.err.println("ERROR: Failed to enrich order " + order.getOrderId() + ": " + e.getMessage());
                    e.printStackTrace();
                    
                    // Still add a basic order map to ensure no orders are lost
                    Map<String, Object> basicOrderMap = new LinkedHashMap<>();
                    basicOrderMap.put("orderId", order.getOrderId());
                    basicOrderMap.put("orderDate", order.getOrderDate());
                    basicOrderMap.put("status", order.getStatus() != null ? order.getStatus() : "Pending");
                    basicOrderMap.put("dealerStaffId", order.getDealerStaffId());
                    basicOrderMap.put("modelId", order.getModelId());
                    basicOrderMap.put("isCustom", false);
                    basicOrderMap.put("customerId", order.getCustomerId());
                    basicOrderMap.put("customerName", "Unknown Customer");
                    basicOrderMap.put("salespersonName", "Unknown Staff");
                    basicOrderMap.put("vehicleName", "Model " + order.getModelId());
                    basicOrderMap.put("orderDetailId", null);
                    basicOrderMap.put("serialId", null);
                    basicOrderMap.put("quantity", "1");
                    basicOrderMap.put("unitPrice", 0.0);
                    basicOrderMap.put("amount", 0.0);
                    basicOrderMap.put("confirmationId", null);
                    basicOrderMap.put("agreement", null);
                    basicOrderMap.put("confirmationDateTime", null);
                    basicOrderMap.put("flaggedForCompany", false);
                    enrichedOrders.add(basicOrderMap);
                }
            }
            
            System.out.println("INFO: ViewAllOrdersController - Successfully enriched " + enrichedOrders.size() + " orders (expected: " + orders.size() + ")");
            
            // Verify we didn't lose any orders
            if (enrichedOrders.size() != orders.size()) {
                System.err.println("WARN: Order count mismatch! Input: " + orders.size() + ", Output: " + enrichedOrders.size());
            }
            
            ResponseUtils.success(response, "Orders retrieved successfully", enrichedOrders);

        } catch (utils.AuthException e) {
            ResponseUtils.error(response, "Authentication failed: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Failed to retrieve orders: " + e.getMessage());
        }
    }
}

