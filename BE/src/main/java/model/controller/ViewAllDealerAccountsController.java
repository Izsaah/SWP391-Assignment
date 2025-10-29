/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import model.dto.UserAccountDTO;
import model.service.UserAccountService;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/EVM/viewAllDealerAccounts")
public class ViewAllDealerAccountsController extends HttpServlet {

    private final UserAccountService userAccountService = new UserAccountService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            List<UserAccountDTO> dealers = userAccountService.getAllDealerAccounts();
            ResponseUtils.success(response, "All dealer accounts retrieved successfully", dealers);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Internal server error: " + e.getMessage());
        }
    }
}
