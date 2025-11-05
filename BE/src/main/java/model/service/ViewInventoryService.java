/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.util.ArrayList;
import java.util.List;
import model.dao.InventoryDAO;
import model.dao.VehicleModelDAO;
import model.dao.VehicleVariantDAO;
import model.dto.InventoryDTO;
import model.dto.VehicleModelDTO;
import model.dto.VehicleVariantDTO;

/**
 *
 * @author khoac
 */
public class ViewInventoryService {

    private VehicleModelDAO modelDAO = new VehicleModelDAO();
    private InventoryDAO inventoryDAO = new InventoryDAO();
    private VehicleVariantDAO variantDAO = new VehicleVariantDAO();

    public List<InventoryDTO> handleViewAllInventory() {
        List<InventoryDTO> inventories = inventoryDAO.viewAllInventory();
        if (inventories != null) {
            for (InventoryDTO inventory : inventories) {
                List<VehicleModelDTO> models = modelDAO.viewVehicleModelById(inventory.getModelId());
                if (models != null) {
                    // Populate variants for each model
                    for (VehicleModelDTO model : models) {
                        List<VehicleVariantDTO> variants = variantDAO.viewVehicleVariantIsActive(model.getModelId());
                        if (variants != null) {
                            model.setLists(variants);
                        }
                    }
                }
                inventory.setList(models);
            }
        }
        return inventories;
    }

    public List<VehicleModelDTO> getInventoryByModelName(String name) {
        List<VehicleModelDTO> models = modelDAO.SearchVehicleModel(name);
        if (models == null || models.isEmpty()) {
            return new ArrayList<>();
        }
        for (VehicleModelDTO tmp : models) {
            int modelId = tmp.getModelId();
            List<InventoryDTO> inventory = inventoryDAO.getInventoryByModelId(modelId);
            if (inventory != null) {
                tmp.setInventoryList(inventory);
            }
        }
        return models;
    }
}
