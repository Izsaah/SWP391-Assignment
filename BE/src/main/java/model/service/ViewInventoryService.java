/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.util.List;
import model.dao.InventoryDAO;
import model.dao.VehicleModelDAO;
import model.dto.InventoryDTO;
import model.dto.VehicleModelDTO;

/**
 *
 * @author khoac
 */
public class ViewInventoryService {
    
    private VehicleModelDAO modelDAO = new VehicleModelDAO();
    private InventoryDAO inventoryDAO = new InventoryDAO();
    
    public List<InventoryDTO> handleViewAllInventory() {
        List<InventoryDTO> inventories = inventoryDAO.viewAllInventory();
        if (inventories != null) {
            for (InventoryDTO inventory : inventories) {
                List<VehicleModelDTO> model = modelDAO.viewVehicleModelById(inventory.getModelId());
                inventory.setList(model);
            }
        }
        return inventories;
    }
}
