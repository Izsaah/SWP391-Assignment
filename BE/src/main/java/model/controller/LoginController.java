package model.controller;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
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
        UserAccountDTO user = service.HandlingLogin(req.getParameter("email"), req.getParameter("password"));
        if (user == null) {
            ResponseUtils.error(resp, "Invalid email or password");
            return;
        }
        String role = (user.getRoles() != null && !user.getRoles().isEmpty())
                ? user.getRoles().get(0).getRoleName()
                : "USER";
        String token = JwtUtil.generateToken(user.getUsername(), Collections.singletonList(role));
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
