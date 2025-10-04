package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

import model.dto.UserAccountDTO;
import model.service.UserAccountService;
import utils.ResponseUtils;

/**
 * Login Controller - Handles user authentication
 * @author ACER
 */
@WebServlet("/api/login")
public class LoginController extends HttpServlet {
    
    private final UserAccountService service = new UserAccountService();
   
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        try {
            // Get parameters
            String username = req.getParameter("username");
            String password = req.getParameter("password");
            
            // Validate input
            if (username == null || username.trim().isEmpty() || 
                password == null || password.trim().isEmpty()) {
                ResponseUtils.error(resp, "Username and password are required");
                return;
            }
            
            // Authenticate user
            UserAccountDTO user = service.HandlingLogin(username, password);
            
            if (user != null) {
                // Create session
                HttpSession session = req.getSession();
                session.setAttribute("user", user);
                session.setAttribute("userId", user.getUserId()); // Adjust based on your DTO
                session.setMaxInactiveInterval(30 * 60); // 30 minutes
                
                ResponseUtils.success(resp, "Login successful", user);
            } else {
                ResponseUtils.error(resp, "Invalid username or password");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "An error occurred during login: " + e.getMessage());
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        ResponseUtils.error(resp, "GET method not supported. Please use POST");
    }
}