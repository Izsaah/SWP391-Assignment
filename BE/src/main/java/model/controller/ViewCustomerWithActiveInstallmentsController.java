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
import utils.JwtUtil;
import utils.ResponseUtils;

@WebServlet("/api/staff/viewCustomerWithActiveInstallments")
public class ViewCustomerWithActiveInstallmentsController extends HttpServlet {

    private final PaymentService paymentService = new PaymentService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            // Extract token and get dealerStaffId from JWT
            String token = JwtUtil.extractToken(request);
            int dealerStaffId = JwtUtil.extractUserId(token);
            
            // Pass dealerStaffId to service method to filter by staff
            List<Map<String, Object>> customers = paymentService.getCustomersWithActiveInstallments(dealerStaffId);

            if (customers == null || customers.isEmpty()) {
                ResponseUtils.success(response, "No customers with active or overdue installments found", Collections.emptyList());
            } else {
                ResponseUtils.success(response, "Active installment customers retrieved successfully", customers);
            }

        } catch (utils.AuthException e) {
            // Handle authentication errors (missing/invalid token)
            ResponseUtils.error(response, "Authentication failed: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Failed to retrieve active installment customers: " + e.getMessage());
        }
    }
}