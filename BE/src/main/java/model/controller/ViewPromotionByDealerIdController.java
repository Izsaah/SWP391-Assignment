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
import java.util.Map;
import model.service.PromotionForDealerService;
import utils.RequestUtils;
import utils.ResponseUtils;

/**
 *
 * @author ACER
 */
@WebServlet("/api/staff/viewPromotionDealerIdController")
public class ViewPromotionByDealerIdController extends HttpServlet {
    private final static PromotionForDealerService service = new PromotionForDealerService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(req);
            
            Object idObj = params.get("dealerId");
            String idParam = (idObj == null) ? null : idObj.toString();

            if (idParam == null || idParam.trim().isEmpty()) {
                ResponseUtils.error(resp, "Dealer ID is required");
                return;
            }

            int id = Integer.parseInt(idParam);

            ResponseUtils.success(resp, "success", service.HandlingViewPromotionForDealer(id));
            
        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid dealer ID format");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "An error occurred while retrieving promotions: " + e.getMessage());
        }
    }
}