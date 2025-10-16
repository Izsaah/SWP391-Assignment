package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import model.dto.OrderDTO;
import model.service.OrderService;
import utils.RequestUtils;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/viewOrders")
public class ViewOrderByCustomerIdController extends HttpServlet {

    private final OrderService orderService = new OrderService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            // Extract customerId from URL parameters
            Map<String, Object> params = RequestUtils.extractParams(req);
            
            Object idObj = params.get("customerId");
            String idParam = (idObj == null) ? null : idObj.toString();

            if (idParam == null || idParam.trim().isEmpty()) {
                ResponseUtils.error(resp, "Customer ID is required");
                return;
            }

            int customerId;
            try {
                customerId = Integer.parseInt(idParam);
            } catch (NumberFormatException e) {
                ResponseUtils.error(resp, "Invalid customer ID format");
                return;
            }

            // Call the service to retrieve the list of orders
            List<OrderDTO> orderList = orderService.HandlingGetOrdersByCustomerId(customerId);

            if (orderList != null && !orderList.isEmpty()) {
                ResponseUtils.success(resp, "Orders found successfully", orderList);
            } else if (orderList != null) {
                // If the list is empty but retrieval succeeded (Collections.emptyList())
                ResponseUtils.success(resp, "No orders found for customer ID: " + customerId, orderList);
            } else {
                 // Should ideally not happen if service returns Collections.emptyList() on failure
                 ResponseUtils.error(resp, "Failed to retrieve orders");
            }

        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "An unexpected error occurred while viewing orders: " + e.getMessage());
        }
    }
}