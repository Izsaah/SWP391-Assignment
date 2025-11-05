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
import model.dao.VehicleVariantDAO;
import model.dto.VehicleModelDTO;
import model.dto.VehicleVariantDTO;
import model.service.VehicleVariantService;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/evm/variants")
public class EVMVariantsController extends HttpServlet {

    private final VehicleVariantService vehicleVariantService = new VehicleVariantService();
    private final VehicleVariantDAO vehicleVariantDAO = new VehicleVariantDAO();
    private final VehicleModelDAO vehicleModelDAO = new VehicleModelDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            // Get all variants (model_id = 0 means all)
            List<VehicleVariantDTO> variants = vehicleVariantDAO.retrieve("1 = 1");
            if (variants == null) {
                variants = new ArrayList<>();
            }
            
            // Transform to match frontend format
            List<Map<String, Object>> result = new ArrayList<>();
            for (VehicleVariantDTO variant : variants) {
                // Get model name
                String modelName = "N/A";
                List<VehicleModelDTO> models = vehicleModelDAO.viewVehicleModelById(variant.getModelId());
                if (models != null && !models.isEmpty()) {
                    modelName = models.get(0).getModelName();
                }
                
                Map<String, Object> map = new HashMap<>();
                map.put("id", variant.getVariantId());
                map.put("modelId", variant.getModelId());
                map.put("model", modelName);
                map.put("version", variant.getVersionName());
                map.put("color", variant.getColor());
                map.put("price", variant.getPrice());
                map.put("active", variant.isIsActive());
                result.add(map);
            }
            
            ResponseUtils.success(response, "Variants retrieved successfully", result);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Failed to retrieve variants: " + e.getMessage());
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
                int variantId = Integer.parseInt(idObj.toString());
                int modelId = params.get("modelId") != null ? Integer.parseInt(params.get("modelId").toString()) : 0;
                String version = params.get("version") != null ? params.get("version").toString() : null;
                String color = params.get("color") != null ? params.get("color").toString() : null;
                double price = params.get("price") != null ? Double.parseDouble(params.get("price").toString()) : 0;
                
                boolean success = vehicleVariantService.updateVehicleVariant(variantId, modelId, version, color, null, price);
                if (success) {
                    ResponseUtils.success(response, "Variant updated successfully", null);
                } else {
                    ResponseUtils.error(response, "Failed to update variant");
                }
            } else {
                // Create request
                int modelId = params.get("modelId") != null ? Integer.parseInt(params.get("modelId").toString()) : 0;
                String version = params.get("version") != null ? params.get("version").toString() : null;
                String color = params.get("color") != null ? params.get("color").toString() : null;
                double price = params.get("price") != null ? Double.parseDouble(params.get("price").toString()) : 0;
                
                if (modelId == 0 || version == null || color == null) {
                    ResponseUtils.error(response, "Model ID, version, and color are required");
                    return;
                }
                
                VehicleVariantDTO created = vehicleVariantService.createVehicleVariant(modelId, version, color, null, price);
                if (created != null) {
                    response.setStatus(HttpServletResponse.SC_CREATED);
                    ResponseUtils.success(response, "Variant created successfully", created);
                } else {
                    ResponseUtils.error(response, "Failed to create variant");
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
                            ResponseUtils.error(response, "Invalid variant ID");
                            return;
                        }
                    }
                }
            }
            
            if (idObj == null) {
                ResponseUtils.error(response, "Variant ID is required");
                return;
            }
            
            int variantId = Integer.parseInt(idObj.toString());
            boolean success = vehicleVariantService.disableVehicleVariant(variantId);
            
            if (success) {
                ResponseUtils.success(response, "Variant deleted successfully", null);
            } else {
                ResponseUtils.error(response, "Failed to delete variant");
            }
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Internal server error: " + e.getMessage());
        }
    }
}

