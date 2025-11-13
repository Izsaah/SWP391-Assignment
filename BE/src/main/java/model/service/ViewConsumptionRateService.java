/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.sql.SQLException;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import model.dao.OrderDAO;
import model.dao.OrderDetailDAO;
import model.dao.VehicleModelDAO;
import model.dto.OrderDTO;
import model.dto.OrderDetailDTO;
import model.dto.VehicleModelDTO;

/**
 *
 * @author khoac
 */
public class ViewConsumptionRateService {

    private VehicleModelDAO modelDAO = new VehicleModelDAO();
    
    public List<String> viewModelConsumptionRate() throws SQLException, ClassNotFoundException {
        List<String> result = new ArrayList<>();

        List<VehicleModelDTO> models = modelDAO.viewVehicleModelIsActive();
        for (VehicleModelDTO model : models) {
            double rate = modelDAO.handleCalculateConsumptionRate(model.getModelId());
            result.add(model.getModelName() + " Consumption Rate: " + String.format("%.2f", rate));
        }

        return result;
    }
}
