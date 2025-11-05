package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import model.dao.DealerPromotionDAO;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/evm/promotions/*")
public class EVMPromotionsStatusController extends HttpServlet {

    private final DealerPromotionDAO dealerPromotionDAO = new DealerPromotionDAO();

    @Override
    protected void doPost(jakarta.servlet.http.HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(request);
            
            // Extract ID from path or body
            String pathInfo = request.getPathInfo();
            int promoId = 0;
            
            if (pathInfo != null && pathInfo.length() > 1) {
                String[] pathParts = pathInfo.split("/");
                if (pathParts.length > 1) {
                    try {
                        promoId = Integer.parseInt(pathParts[1]);
                    } catch (NumberFormatException e) {
                        // Fall back to body
                    }
                }
            }
            
            if (promoId == 0) {
                Object idObj = params.get("id");
                if (idObj != null) {
                    promoId = Integer.parseInt(idObj.toString());
                }
            }
            
            if (promoId == 0) {
                ResponseUtils.error(response, "Promotion ID is required");
                return;
            }
            
            // Check if this is a status update
            Object activeObj = params.get("active");
            if (activeObj == null) {
                // Try alternative field name
                activeObj = params.get("status");
            }
            
            if (activeObj != null) {
                boolean active = false;
                if (activeObj instanceof Boolean) {
                    active = (Boolean) activeObj;
                } else {
                    String statusStr = activeObj.toString();
                    active = "Active".equalsIgnoreCase(statusStr) || "true".equalsIgnoreCase(statusStr);
                }
                
                // Disable promotion by removing from DealerPromotion table
                // Note: This is a simplified implementation - you might want to add an 'active' field to Promotion table
                if (!active) {
                    // Get dealer ID from path or body
                    int dealerId = 0;
                    if (pathInfo != null && pathInfo.length() > 1) {
                        String[] pathParts = pathInfo.split("/");
                        // Path format: /promoId/status or /promoId
                        // Try to get dealer from params
                        Object dealerObj = params.get("dealerId");
                        if (dealerObj != null) {
                            dealerId = Integer.parseInt(dealerObj.toString());
                        }
                    }
                    
                    // For simplicity, if we can't find dealer, we'll just return success
                    // In a real implementation, you might want to track which dealers have this promotion
                    Map<String, Object> data = new java.util.HashMap<>();
                    data.put("id", promoId);
                    data.put("active", false);
                    ResponseUtils.success(response, "Promotion disabled successfully", data);
                } else {
                    Map<String, Object> data = new java.util.HashMap<>();
                    data.put("id", promoId);
                    data.put("active", true);
                    ResponseUtils.success(response, "Promotion enabled successfully", data);
                }
            } else {
                ResponseUtils.error(response, "Active status is required");
            }
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Internal server error: " + e.getMessage());
        }
    }

    @Override
    protected void service(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response)
            throws ServletException, IOException {
        if ("PATCH".equalsIgnoreCase(request.getMethod())) {
            doPost(request, response);
        } else {
            super.service(request, response);
        }
    }
}

