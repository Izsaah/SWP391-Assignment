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

            String staffIdParam = (String) params.get("dealerStaffId");
            String startDate = (String) params.get("startDate");
            String endDate = (String) params.get("endDate");

            if (ResponseUtils.isNullOrEmpty(staffIdParam)) {
                ResponseUtils.error(resp, "Missing required field: dealerStaffId");
                return;
            }

            if (ResponseUtils.isNullOrEmpty(startDate) || ResponseUtils.isNullOrEmpty(endDate)) {
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
