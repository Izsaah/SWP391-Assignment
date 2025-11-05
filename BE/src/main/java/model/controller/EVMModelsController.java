package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import model.dao.VehicleModelDAO;
import model.dto.VehicleModelDTO;
import model.service.VehicleModelService;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/evm/models")
public class EVMModelsController extends HttpServlet {

    private final VehicleModelService vehicleModelService = new VehicleModelService();
    private final VehicleModelDAO vehicleModelDAO = new VehicleModelDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            List<VehicleModelDTO> models = vehicleModelDAO.viewAllVehicleModel();
            if (models == null) {
                models = new ArrayList<>();
            }
            
            // Transform to match frontend format
            List<Map<String, Object>> result = new ArrayList<>();
            for (VehicleModelDTO model : models) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", model.getModelId());
                map.put("name", model.getModelName());
                map.put("description", model.getDescription());
                map.put("brand", "EVM"); // Default brand
                map.put("year", 2025); // Default year
                map.put("variants", 0); // Could count variants if needed
                map.put("active", model.isIsActive());
                result.add(map);
            }
            
            ResponseUtils.success(response, "Models retrieved successfully", result);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Failed to retrieve models: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(request);
            
            // Check if this is an update request
            Object idObj = params.get("id");
            if (idObj != null) {
                // Update request
                int modelId = Integer.parseInt(idObj.toString());
                String name = params.get("name") != null ? params.get("name").toString() : null;
                String description = params.get("description") != null ? params.get("description").toString() : name;
                
                boolean success = vehicleModelService.updateVehicleModel(modelId, name, description);
                if (success) {
                    ResponseUtils.success(response, "Model updated successfully", null);
                } else {
                    ResponseUtils.error(response, "Failed to update model");
                }
            } else {
                // Create request
                String name = params.get("name") != null ? params.get("name").toString() : null;
                String description = params.get("description") != null ? params.get("description").toString() : name;
                
                if (name == null || name.trim().isEmpty()) {
                    ResponseUtils.error(response, "Model name is required");
                    return;
                }
                
                VehicleModelDTO created = vehicleModelService.createVehicleModel(name, description);
                if (created != null) {
                    response.setStatus(HttpServletResponse.SC_CREATED);
                    ResponseUtils.success(response, "Model created successfully", created);
                } else {
                    ResponseUtils.error(response, "Failed to create model");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Internal server error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doPost(request, response); // Redirect PUT to POST handler
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(request);
            
            Object idObj = params.get("id");
            if (idObj == null) {
                // Try to get from path
                String pathInfo = request.getPathInfo();
                if (pathInfo != null && pathInfo.length() > 1) {
                    String[] pathParts = pathInfo.split("/");
                    if (pathParts.length > 1) {
                        try {
                            idObj = Integer.parseInt(pathParts[1]);
                        } catch (NumberFormatException e) {
                            ResponseUtils.error(response, "Invalid model ID");
                            return;
                        }
                    }
                }
            }
            
            if (idObj == null) {
                ResponseUtils.error(response, "Model ID is required");
                return;
            }
            
            int modelId = Integer.parseInt(idObj.toString());
            boolean success = vehicleModelService.disableVehicleModel(modelId);
            
            if (success) {
                ResponseUtils.success(response, "Model deleted successfully", null);
            } else {
                ResponseUtils.error(response, "Failed to delete model");
            }
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Internal server error: " + e.getMessage());
        }
    }
}

