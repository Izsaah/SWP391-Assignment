package model.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import model.dto.UserAccountDTO;
import model.service.UserAccountService;
import utils.JwtUtil;
import utils.ResponseUtils;

@WebServlet("/api/login")
public class LoginController extends HttpServlet {

    private final UserAccountService service = new UserAccountService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        
        String email = req.getParameter("email");
        String password = req.getParameter("password");

        if (email == null || password == null) {
            ResponseUtils.error(resp, "Email and password are required");
            return;
        }

        UserAccountDTO user = service.HandlingLogin(email, password);
        if (user == null) {
            ResponseUtils.error(resp, "Invalid email or password");
            return;
        }


        String token = JwtUtil.generateToken(user);

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);

        ResponseUtils.success(resp, "Login successful", data);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        ResponseUtils.error(resp, "GET method not supported. Please use POST");
    }
}
