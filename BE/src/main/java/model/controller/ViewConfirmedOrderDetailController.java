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
import java.util.Map;
import model.service.OrderService;
import utils.RequestUtils;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/EVM/viewConfirmedOrderDetails")
public class ViewConfirmedOrderDetailController extends HttpServlet {

    private final OrderService service = new OrderService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(req);

            // Get order_detail_id from request
            Object orderDetailIdObj = params.get("order_detail_id");
            if (orderDetailIdObj == null) {
                ResponseUtils.error(resp, "Missing parameter: order_detail_id");
                return;
            }

            int orderDetailId = Integer.parseInt(orderDetailIdObj.toString());

            List<Map<String, Object>> details = service.retrieveOrdersWithConfirmedDetails(orderDetailId);

            if (details != null && !details.isEmpty()) {
                ResponseUtils.success(resp, "Confirmed order details retrieved successfully", details);
            } else {
                ResponseUtils.success(resp, "No confirmed order details found", details);
            }

        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid order_detail_id format");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Error retrieving confirmed order details: " + e.getMessage());
        }
    }
}
