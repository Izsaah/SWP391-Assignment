/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import javax.json.Json;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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
