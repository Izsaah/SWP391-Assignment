package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import model.dto.InstallmentPlanDTO;
import model.dto.PaymentDTO;
import model.service.PaymentService;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/staff/createPayment")
public class CreatePaymentController extends HttpServlet {

    private final PaymentService paymentService = new PaymentService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(request);

            if (!params.containsKey("orderId") || !params.containsKey("method")) {
                ResponseUtils.error(response, "Missing required fields: orderId and method");
                return;
            }

            int orderId = Integer.parseInt(params.get("orderId").toString());
            String method = params.get("method").toString();

            InstallmentPlanDTO plan = null;
            if (!"TT".equalsIgnoreCase(method)) {
                plan = new InstallmentPlanDTO();
                plan.setInterestRate(params.getOrDefault("interestRate", "0").toString());
                plan.setTermMonth(params.getOrDefault("termMonth", "12").toString());
                plan.setMonthlyPay(params.getOrDefault("monthlyPay", "0").toString());

                String status = params.getOrDefault("status", "Active").toString().toUpperCase();
                if (!status.equalsIgnoreCase("Active")
                        && !status.equalsIgnoreCase("Paid")
                        && !status.equalsIgnoreCase("Overdue")) {
                    status = "Active";
                }
                plan.setStatus(status);
            }

            PaymentDTO result = paymentService.processPayment(orderId, method, plan);

            if (result != null) {
                ResponseUtils.success(response, "Payment processed successfully", result);
            } else {
                ResponseUtils.error(response, "Payment processing failed");
            }

        } catch (NumberFormatException e) {
            ResponseUtils.error(response, "Invalid number format: " + e.getMessage());
        } catch (ClassNotFoundException e) {
            ResponseUtils.error(response, "Database error: " + e.getMessage());
        } catch (Exception e) {
            ResponseUtils.error(response, "Error: " + e.getClass().getSimpleName()
                    + (e.getMessage() != null ? (": " + e.getMessage()) : ""));
        }
    }
}
