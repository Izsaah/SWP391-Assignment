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
import model.service.ViewPromotionForDealerService;
import utils.ResponseUtils;

/**
 *
 * @author ACER
 */
@WebServlet("/api/viewPromotionDealerIdController")
public class ViewPromotionByDealerIdController extends HttpServlet{
    private final static ViewPromotionForDealerService service= new ViewPromotionForDealerService();
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        try {
          int id = Integer.parseInt(req.getParameter("dealerId"));

            ResponseUtils.success(resp, "success", service.HandlingViewPromotionForDealer(id));
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "An error occurred while retrieving vehicles: " + e.getMessage());
        }
    }
}
