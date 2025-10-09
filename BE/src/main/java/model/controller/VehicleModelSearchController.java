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
import model.dao.VehicleModelDAO;
import model.dto.VehicleModelDTO;
import utils.ResponseUtils;


/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/searchVehicleModel")
public class VehicleModelSearchController extends HttpServlet {
    private final VehicleModelDAO vdao = new VehicleModelDAO();
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String name = req.getParameter("name");

        if (name == null || name.trim().isEmpty()) {
            ResponseUtils.error(resp, "Model name is required");
            return;
        }

        List<VehicleModelDTO> model = vdao.SearchVehicleModel(name.trim());

        if (model != null && !model.isEmpty()) {
            ResponseUtils.success(resp, "Model found", model);
        } else {
            ResponseUtils.error(resp, "No model found with name: " + name);
        }
    }
}
