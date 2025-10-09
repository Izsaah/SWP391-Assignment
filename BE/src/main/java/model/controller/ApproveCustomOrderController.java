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
import model.service.CreateOrderService;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/approveCustomOrder")
public class ApproveCustomOrderController extends HttpServlet {

    private final CreateOrderService service = new CreateOrderService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            int orderId = Integer.parseInt(req.getParameter("orderId"));
            boolean isAgree = Boolean.parseBoolean(req.getParameter("isAgree"));
            double unitPrice = Double.parseDouble(req.getParameter("unitPrice"));

            boolean result = service.approveCustomOrder(orderId, isAgree, unitPrice);

            if (result) {
                ResponseUtils.success(resp, "Custom order processed successfully", 
                        isAgree ? "Approved" : "Disagreed");
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
