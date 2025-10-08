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
import model.dao.UserAccountDAO;
import model.dto.UserAccountDTO;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/searchDealerStaff")
public class DealerStaffSearchController extends HttpServlet {

    private final UserAccountDAO userDAO = new UserAccountDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        String name = req.getParameter("username");

        if (name == null || name.trim().isEmpty()) {
            ResponseUtils.error(resp, "Dealer staff name is required");
            return;
        }

        try {
            // Search dealer staff by username (partial match)
            List<UserAccountDTO> users = userDAO.searchDealerStaffAndManagerByName(name.trim());

            if (users == null || users.isEmpty()) {
                ResponseUtils.error(resp, "No DealerStaff found with name: " + name);
                return;
            }

            // Return the list of dealer staff
            ResponseUtils.success(resp, "DealerStaff found", users);

        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Error searching DealerStaff: " + e.getMessage());
        }

    }
}
