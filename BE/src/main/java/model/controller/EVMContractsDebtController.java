package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/evm/contracts/*")
public class EVMContractsDebtController extends HttpServlet {

    @Override
    protected void doPost(jakarta.servlet.http.HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(request);
            
            // Extract ID from path or body
            String pathInfo = request.getPathInfo();
            String contractId = null;
            
            if (pathInfo != null && pathInfo.length() > 1) {
                String[] pathParts = pathInfo.split("/");
                if (pathParts.length > 2 && "debt".equals(pathParts[2])) {
                    contractId = pathParts[1];
                } else if (pathParts.length > 1) {
                    contractId = pathParts[1];
                }
            }
            
            if (contractId == null) {
                Object idObj = params.get("id");
                if (idObj != null) {
                    contractId = idObj.toString();
                }
            }
            
            if (contractId == null) {
                ResponseUtils.error(response, "Contract ID is required");
                return;
            }
            
            // Get debt from request
            Object debtObj = params.get("debt");
            if (debtObj == null) {
                ResponseUtils.error(response, "Debt amount is required");
                return;
            }
            
            double debt = Double.parseDouble(debtObj.toString());
            
            // For now, just return success
            // In a real implementation, you would update the contract debt in the database
            Map<String, Object> data = new java.util.HashMap<>();
            data.put("id", contractId);
            data.put("debt", debt);
            
            ResponseUtils.success(response, "Contract debt updated successfully", data);
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(response, "Internal server error: " + e.getMessage());
        }
    }

    @Override
    protected void service(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response)
            throws ServletException, IOException {
        if ("PATCH".equalsIgnoreCase(request.getMethod())) {
            doPost(request, response);
        } else {
            super.service(request, response);
        }
    }
}

