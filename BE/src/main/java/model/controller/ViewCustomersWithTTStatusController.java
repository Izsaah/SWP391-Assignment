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

@WebServlet("/api/staff/viewCustomerWithTTStatus")
public class ViewCustomersWithTTStatusController extends HttpServlet {

    private final PaymentService paymentService = new PaymentService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            List<Map<String, Object>> customers = paymentService.getAllCustomersWithTTStatus();

            if (customers == null || customers.isEmpty()) {
                ResponseUtils.success(response, "No customers with TT status found", Collections.emptyList());
            } else {
                ResponseUtils.success(response, "Active installment customers retrieved successfully", customers);
            }

        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Failed to retrieve active installment customers: " + e.getMessage());
        }
    }
}
