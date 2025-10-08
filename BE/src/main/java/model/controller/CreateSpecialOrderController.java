/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import model.dto.SpecialOrderDTO;
import model.service.CreateSpecialOrderService;
import utils.JwtUtil;
import utils.ResponseUtils;

/**
 *
 * @author ACER
 */
@WebServlet("/api/staff/createSpecialOrder")
public class CreateSpecialOrderController extends HttpServlet {

    private final CreateSpecialOrderService CSService = new CreateSpecialOrderService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String token = JwtUtil.extractToken(req);
        int staffId = JwtUtil.extractUserId(token);

        int customerId = Integer.parseInt(req.getParameter("customer_id"));
        int modelId = Integer.parseInt(req.getParameter("model_id"));

        String description = req.getParameter("description");
        String quantity = req.getParameter("quantity");

        SpecialOrderDTO order = CSService.handlingCreateSpecialOrder(
                customerId,
                staffId,
                modelId,
                description,
                quantity
        );

        if (order == null) {
            ResponseUtils.error(resp, "Failed to create special order");
        } else {
            ResponseUtils.success(resp, "Special order created", order);
        }
    }

}
