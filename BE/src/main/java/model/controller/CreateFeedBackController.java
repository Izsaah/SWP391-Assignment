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
import model.dto.FeedbackDTO;
import model.service.CreateFeedBackService;
import utils.ResponseUtils;

/**
 *
 * @author ACER
 */
@WebServlet("/api/staff/createFeedBack")
public class CreateFeedBackController extends HttpServlet {

    private final CreateFeedBackService CFBService = new CreateFeedBackService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
              
        int customerId = Integer.parseInt(req.getParameter("customer_id"));
        int orderId = Integer.parseInt(req.getParameter("order_id"));

        String type = req.getParameter("type");
        String content = req.getParameter("content");
        String status=req.getParameter("status");
        FeedbackDTO feedback=CFBService.handlingCreateFeedBack(customerId, orderId, type, content, status);
        if (feedback == null) {
            ResponseUtils.error(resp, "Failed to create special order");
        } else {
            ResponseUtils.success(resp, "Special order created", feedback);
        }
    }

}
