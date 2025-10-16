package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import model.dto.SaleRecordDTO;
import model.service.SaleRecordService;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/staff/salesRecords")
public class SaleRecordController extends HttpServlet {

    private final SaleRecordService service = new SaleRecordService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        try {
            Map<String, Object> params = RequestUtils.extractParams(req);

            Object staffIdObj = params.get("dealerStaffId");
            String staffIdParam = (staffIdObj == null) ? null : staffIdObj.toString();
            
            Object startDateObj = params.get("startDate");
            String startDate = (startDateObj == null) ? null : startDateObj.toString();
            
            Object endDateObj = params.get("endDate");
            String endDate = (endDateObj == null) ? null : endDateObj.toString();

            if (staffIdParam == null || staffIdParam.trim().isEmpty()) {
                ResponseUtils.error(resp, "Missing required field: dealerStaffId");
                return;
            }

            if (startDate == null || startDate.trim().isEmpty() || endDate == null || endDate.trim().isEmpty()) {
                ResponseUtils.error(resp, "Both 'startDate' and 'endDate' are required.");
                return;
            }

            int dealerStaffId = Integer.parseInt(staffIdParam);

            List<SaleRecordDTO> sales = service.getCombinedSaleRecordsForStaffByDateRange(
                    dealerStaffId,
                    startDate,
                    endDate
            );

            if (sales == null || sales.isEmpty()) {
                ResponseUtils.success(resp, "No sales records found for this period.", Collections.emptyList());
            } else {
                ResponseUtils.success(resp, "Successfully retrieved summarized sales records.", sales);
            }

        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid 'dealerStaffId': must be a number.");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Error fetching sales records: " + e.getMessage());
        }
    }
}