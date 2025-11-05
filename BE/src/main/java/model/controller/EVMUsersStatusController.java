package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import model.service.UserAccountService;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/evm/users/*")
public class EVMUsersStatusController extends HttpServlet {

    private final UserAccountService userAccountService = new UserAccountService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(request);
            
            // Extract ID from path or body
            String pathInfo = request.getPathInfo();
            int userId = 0;
            
            if (pathInfo != null && pathInfo.length() > 1) {
                // Try to extract ID from path like /123/status or /123
                String[] pathParts = pathInfo.split("/");
                if (pathParts.length > 1) {
                    try {
                        userId = Integer.parseInt(pathParts[1]);
                    } catch (NumberFormatException e) {
                        // Fall back to body
                    }
                }
            }
            
            // If not found in path, try body
            if (userId == 0) {
                Object idObj = params.get("id");
                if (idObj != null) {
                    userId = Integer.parseInt(idObj.toString());
                }
            }
            
            if (userId == 0) {
                ResponseUtils.error(response, "User ID is required");
                return;
            }
            
            // Check if this is a status update
            Object statusObj = params.get("status");
            if (statusObj != null) {
                String status = statusObj.toString();
                boolean isActive = "Active".equalsIgnoreCase(status);
                
                boolean success = isActive 
                    ? userAccountService.enableDealerAccount(userId)
                    : userAccountService.disableDealerAccount(userId);
                
                if (success) {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", userId);
                    data.put("status", status);
                    ResponseUtils.success(response, "User status updated successfully", data);
                } else {
                    ResponseUtils.error(response, "Failed to update user status");
                }
            } else {
                ResponseUtils.error(response, "Status is required");
            }
        } catch (IllegalArgumentException e) {
            ResponseUtils.error(response, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Internal server error: " + e.getMessage());
        }
    }

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        if ("PATCH".equalsIgnoreCase(request.getMethod())) {
            doPost(request, response);
        } else {
            super.service(request, response);
        }
    }
}

