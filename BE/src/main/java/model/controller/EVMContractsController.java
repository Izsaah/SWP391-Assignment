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
import model.service.SaleRecordService;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/evm/contracts")
public class EVMContractsController extends HttpServlet {

    private final SaleRecordService saleRecordService = new SaleRecordService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            // Get dealer sales summary which can be used as contracts
            List<Map<String, Object>> contracts = saleRecordService.getDealerSalesSummary();
            if (contracts == null) {
                contracts = new ArrayList<>();
            }
            
            // Transform to match frontend format
            List<Map<String, Object>> result = new ArrayList<>();
            for (Map<String, Object> contract : contracts) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", contract.get("dealerId") != null ? "C-" + contract.get("dealerId") : "C-0");
                map.put("dealer", contract.get("dealerName") != null ? contract.get("dealerName").toString() : "N/A");
                map.put("target", contract.get("targetUnits") != null ? contract.get("targetUnits") : 100);
                map.put("achieved", contract.get("totalUnits") != null ? contract.get("totalUnits") : 0);
                map.put("debt", contract.get("totalRevenue") != null ? contract.get("totalRevenue") : 0);
                map.put("status", "Active");
                result.add(map);
            }
            
            ResponseUtils.success(response, "Contracts retrieved successfully", result);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Failed to retrieve contracts: " + e.getMessage());
        }
    }
}

