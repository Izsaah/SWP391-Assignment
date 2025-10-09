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
import model.dao.VehicleVariantDAO;
import model.dto.VehicleVariantDTO;
import utils.ResponseUtils;


/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/searchVehicleVariant")
public class VehicleVariantSearchController extends HttpServlet {
    private final VehicleVariantDAO vdao = new VehicleVariantDAO();
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        int model_id = Integer.parseInt(req.getParameter("id"));

        List<VehicleVariantDTO> variant = vdao.viewVehicleVariantIsActive(model_id);

        if (variant != null && !variant.isEmpty()) {
            ResponseUtils.success(resp, "Variant found", variant);
        } else {
            ResponseUtils.error(resp, "No variant found with id: " + model_id);
        }
    }
    
}
