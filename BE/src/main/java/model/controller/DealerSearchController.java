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
import model.dao.DealerDAO;
import model.dto.DealerDTO;
import utils.ResponseUtils;


/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/searchDealer")
public class DealerSearchController extends HttpServlet {

    private final DealerDAO dealerDAO = new DealerDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String name = req.getParameter("name");
        if (name == null || name.trim().isEmpty()) {
            ResponseUtils.error(resp, "Dealer name is required");
            return;
        }

        List<DealerDTO> dealer = dealerDAO.findByName(name.trim());
        if (dealer != null) {
            ResponseUtils.success(resp, "Dealer found", dealer);
        } else {
            ResponseUtils.error(resp, "Dealer not found");
        }
    }
}

