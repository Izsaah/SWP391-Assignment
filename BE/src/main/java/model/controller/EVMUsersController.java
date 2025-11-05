package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import model.dto.UserAccountDTO;
import model.service.UserAccountService;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/evm/users")
public class EVMUsersController extends HttpServlet {

    private final UserAccountService userAccountService = new UserAccountService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            List<UserAccountDTO> users = userAccountService.getAllDealerAccounts();
            ResponseUtils.success(response, "Users retrieved successfully", users);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Failed to retrieve users: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(request);
            
            // Check if this is an update request (has id)
            Object idObj = params.get("id");
            if (idObj != null) {
                // This is an update request
                int userId = Integer.parseInt(idObj.toString());
                String email = params.get("email") != null ? params.get("email").toString() : null;
                String username = params.get("name") != null ? params.get("name").toString() : null;
                String phoneNumber = params.get("phone") != null ? params.get("phone").toString() : null;
                String password = params.get("password") != null ? params.get("password").toString() : null;
                
                // Map role from string to roleId
                int roleId = 3; // Default to Staff
                Object roleObj = params.get("role");
                if (roleObj != null) {
                    String role = roleObj.toString();
                    if ("Dealer Admin".equals(role) || "Manager".equals(role)) {
                        roleId = 2;
                    } else if ("Dealer Staff".equals(role) || "Staff".equals(role)) {
                        roleId = 3;
                    }
                }
                
                UserAccountDTO updatedUser = userAccountService.updateDealerAccount(
                        userId, email, username, phoneNumber, password, roleId
                );
                
                if (updatedUser != null) {
                    ResponseUtils.success(response, "User updated successfully", updatedUser);
                } else {
                    ResponseUtils.error(response, "Failed to update user");
                }
            } else {
                // This is a create request
                String email = params.get("email") != null ? params.get("email").toString() : null;
                String username = params.get("name") != null ? params.get("name").toString() : null;
                String password = params.get("password") != null ? params.get("password").toString() : "default123";
                String phoneNumber = params.get("phone") != null ? params.get("phone").toString() : null;
                
                // Map dealer from string to dealerId (simplified - you may need to adjust)
                int dealerId = 1; // Default dealer
                Object dealerObj = params.get("dealer");
                if (dealerObj != null) {
                    String dealer = dealerObj.toString();
                    // Map dealer name to ID (you may need to add a method to get dealer ID by name)
                    if (dealer.contains("A")) dealerId = 1;
                    else if (dealer.contains("B")) dealerId = 2;
                    else if (dealer.contains("C")) dealerId = 3;
                }
                
                // Map role from string to roleId
                int roleId = 3; // Default to Staff
                Object roleObj = params.get("role");
                if (roleObj != null) {
                    String role = roleObj.toString();
                    if ("Dealer Admin".equals(role) || "Manager".equals(role)) {
                        roleId = 2;
                    } else if ("Dealer Staff".equals(role) || "Staff".equals(role)) {
                        roleId = 3;
                    }
                }
                
                UserAccountDTO createdUser = userAccountService.createDealerAccount(
                        dealerId, email, username, password, phoneNumber, roleId
                );
                
                if (createdUser != null) {
                    response.setStatus(HttpServletResponse.SC_CREATED);
                    ResponseUtils.success(response, "User created successfully", createdUser);
                } else {
                    ResponseUtils.error(response, "Failed to create user");
                }
            }
        } catch (IllegalArgumentException e) {
            ResponseUtils.error(response, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Internal server error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doPost(request, response); // Redirect PUT to POST handler
    }
}

