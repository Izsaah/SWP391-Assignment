package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import model.dao.DealerPromotionDAO;
import model.dao.PromotionDAO;
import model.dto.PromotionDTO;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/evm/promotions")
public class EVMPromotionsController extends HttpServlet {

    private final PromotionDAO promotionDAO = new PromotionDAO();
    private final DealerPromotionDAO dealerPromotionDAO = new DealerPromotionDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            // Get all promotions with dealer info
            List<Map<String, Object>> promotionsWithDealers = dealerPromotionDAO.getAllPromotionsWithDealers();
            if (promotionsWithDealers == null) {
                promotionsWithDealers = new ArrayList<>();
            }
            
            // Transform to match frontend format
            List<Map<String, Object>> result = new ArrayList<>();
            for (Map<String, Object> promo : promotionsWithDealers) {
                // Extract dealers list
                List<Map<String, Object>> dealers = (List<Map<String, Object>>) promo.get("dealers");
                if (dealers != null && !dealers.isEmpty()) {
                    // Create one entry per dealer
                    for (Map<String, Object> dealer : dealers) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", promo.get("promoId"));
                        map.put("dealer", dealer.get("dealerName") != null ? dealer.get("dealerName").toString() : "N/A");
                        map.put("name", promo.get("description") != null ? promo.get("description").toString() : "N/A");
                        map.put("type", promo.get("type") != null ? promo.get("type").toString() : "Discount");
                        map.put("value", promo.get("discountRate") != null ? promo.get("discountRate").toString() + "%" : "0%");
                        map.put("from", promo.get("startDate") != null ? promo.get("startDate").toString() : "");
                        map.put("to", promo.get("endDate") != null ? promo.get("endDate").toString() : "");
                        map.put("active", true); // Default to active
                        result.add(map);
                    }
                } else {
                    // No dealer assigned, create entry without dealer
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", promo.get("promoId"));
                    map.put("dealer", "N/A");
                    map.put("name", promo.get("description") != null ? promo.get("description").toString() : "N/A");
                    map.put("type", promo.get("type") != null ? promo.get("type").toString() : "Discount");
                    map.put("value", promo.get("discountRate") != null ? promo.get("discountRate").toString() + "%" : "0%");
                    map.put("from", promo.get("startDate") != null ? promo.get("startDate").toString() : "");
                    map.put("to", promo.get("endDate") != null ? promo.get("endDate").toString() : "");
                    map.put("active", true);
                    result.add(map);
                }
            }
            
            ResponseUtils.success(response, "Promotions retrieved successfully", result);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Failed to retrieve promotions: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(request);
            
            // Check if this is an update request
            Object idObj = params.get("id");
            if (idObj != null) {
                // Update request
                int promoId = Integer.parseInt(idObj.toString());
                String name = params.get("name") != null ? params.get("name").toString() : "";
                String type = params.get("type") != null ? params.get("type").toString() : "Discount";
                String value = params.get("value") != null ? params.get("value").toString().replace("%", "") : "0";
                String from = params.get("from") != null ? params.get("from").toString() : "";
                String to = params.get("to") != null ? params.get("to").toString() : "";
                
                boolean success = promotionDAO.update(promoId, name, from, to, value, type);
                if (success) {
                    ResponseUtils.success(response, "Promotion updated successfully", null);
                } else {
                    ResponseUtils.error(response, "Failed to update promotion");
                }
            } else {
                // Create request
                String name = params.get("name") != null ? params.get("name").toString() : "";
                String type = params.get("type") != null ? params.get("type").toString() : "Discount";
                String value = params.get("value") != null ? params.get("value").toString().replace("%", "") : "0";
                String from = params.get("from") != null ? params.get("from").toString() : "";
                String to = params.get("to") != null ? params.get("to").toString() : "";
                
                if (name.isEmpty() || from.isEmpty() || to.isEmpty()) {
                    ResponseUtils.error(response, "Name, from date, and to date are required");
                    return;
                }
                
                PromotionDTO created = promotionDAO.create(name, from, to, value, type);
                if (created != null) {
                    // Also assign to dealer if dealer is provided
                    Object dealerObj = params.get("dealer");
                    if (dealerObj != null) {
                        String dealer = dealerObj.toString();
                        int dealerId = 1; // Default
                        if (dealer.contains("A")) dealerId = 1;
                        else if (dealer.contains("B")) dealerId = 2;
                        else if (dealer.contains("C")) dealerId = 3;
                        
                        dealerPromotionDAO.createPromotionForDealer(created.getPromoId(), dealerId);
                    }
                    
                    response.setStatus(HttpServletResponse.SC_CREATED);
                    ResponseUtils.success(response, "Promotion created successfully", created);
                } else {
                    ResponseUtils.error(response, "Failed to create promotion");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Internal server error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doPost(request, response);
    }
}

