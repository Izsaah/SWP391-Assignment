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
import model.service.CustomerDebtService;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/staff/debt")
public class CustomerDebtController extends HttpServlet {

    private final CustomerDebtService service = new CustomerDebtService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        try {
            Map<String, Object> params = RequestUtils.extractParams(req);
            
            // Extract and ensure it's treated as a String for initial check
            Object customerIdObj = params.get("customerId");
            String customerIdParam = (customerIdObj == null) ? null : customerIdObj.toString();

            if (customerIdParam == null || customerIdParam.trim().isEmpty()) {
                ResponseUtils.error(resp, "Missing required field: customerId");
                return;
            }

            int customerId = Integer.parseInt(customerIdParam);
            double totalDebt = service.getDebtByCustomerId(customerId);

            ResponseUtils.success(resp, "Successfully retrieved customer debt.", totalDebt);

        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid 'customerId': must be a number.");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Error fetching customer debt: " + e.getMessage());
        }
    }
}