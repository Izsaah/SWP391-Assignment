package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
<<<<<<< HEAD
import java.util.Map;
import model.service.CompareModelFeaturesService;
import utils.RequestUtils;
=======
import model.service.CompareModelService;
import model.service.ViewVehicleService;
>>>>>>> master
import utils.ResponseUtils;

@WebServlet("/api/public/compareVehicle")
public class CompareModelFeaturesController extends HttpServlet {

    private final CompareModelService service = new CompareModelService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(req);
            String vehicleName = String.valueOf(params.get("vehicleName"));
            Object searchResult = service.HandlingSearchVehicleByVehicleName(vehicleName);

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
