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
import model.service.CompareModelFeaturesService;
import model.service.ViewVehicleService;
import utils.ResponseUtils;

/**
 *
 * @author ACER
 */
@WebServlet("/api/public/compareVehicle")
public class CompareModelFeaturesController extends HttpServlet{
      private final CompareModelFeaturesService service = new CompareModelFeaturesService();
   
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        try {
            String VehicleName=req.getParameter("vehicleName");
            ResponseUtils.success(resp, "success", service.HandlingSearchVehicleByVehicleName(VehicleName));
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "An error occurred while retrieving vehicles: " + e.getMessage());
        }
    }
}
