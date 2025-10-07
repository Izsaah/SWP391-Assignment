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
import java.util.List;
import model.service.CompareModelService;
import model.service.ViewVehicleService;
import utils.ResponseUtils;

/**
 *
 * @author ACER
 */
@WebServlet("/api/public/compareVehicle")
public class CompareModelFeaturesController extends HttpServlet {

    private final CompareModelService service = new CompareModelService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            String VehicleName = req.getParameter("vehicleName");
            
            Object searchResult = service.HandlingSearchVehicleByVehicleName(VehicleName);

            if (searchResult != null && !((List<?>) searchResult).isEmpty()) {
              
                ResponseUtils.success(resp, "success", searchResult);
            } else {

                ResponseUtils.error(resp, "No vehicles found with that name.");

            }
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "An error occurred while retrieving vehicles: " + e.getMessage());
        }
    }
}
