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
import model.dto.CustomerDTO;
import model.service.FeedBackService;
import utils.RequestUtils;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/getCustomerFeedback")
public class GetFeedbackByCustomerIdController extends HttpServlet {

    private final FeedBackService service = new FeedBackService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
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

            // Get customer with their feedback list
            CustomerDTO customer = service.getFeedbackByCustomerId(customerId);

            if (customer != null) {
                ResponseUtils.success(resp, "Customer feedback retrieved successfully", customer);
            } else {
                ResponseUtils.error(resp, "Customer not found with ID: " + customerId);
            }

        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Error retrieving customer feedback: " + e.getMessage());
        }
    }
}
