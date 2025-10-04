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
import model.dto.UserAccountDTO;
import model.service.UserAccountService;
import utils.ResponseUtils;

/**
 *
 * @author ACER
 */
@WebServlet("/api/login")
public class LoginController extends HttpServlet{
    private final UserAccountService service = new UserAccountService();


   
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        UserAccountDTO user=service.HandlingLogin(req.getParameter("username"), req.getParameter("password"));
        if(user!=null){
            ResponseUtils.success(resp, "Login successful", user);
        }else{
            ResponseUtils.error(resp, "Invalid username or password");
        }
    }
    
    
}
