package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import model.dto.TestDriveScheduleDTO;
import model.service.TestDriveScheduleService;
import utils.RequestUtils;
import utils.ResponseUtils;

/**
 *
 * @author ACER
 */
@WebServlet("/api/staff/updateScheduleStatus")
public class UpdateScheduleController extends HttpServlet {

    private final TestDriveScheduleService scheduleService = new TestDriveScheduleService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        
        try {
            Map<String, Object> params = RequestUtils.extractParams(req);
            
            Object appointmentIdObj = params.get("appointment_id");
            String appointmentIdParam = (appointmentIdObj == null) ? null : appointmentIdObj.toString();
            
            Object newStatusObj = params.get("new_status");
            String newStatus = (newStatusObj == null) ? null : newStatusObj.toString();
            
            if (appointmentIdParam == null || appointmentIdParam.trim().isEmpty() || newStatus == null || newStatus.trim().isEmpty()) {
                ResponseUtils.error(resp, "Missing required fields: appointment_id and new_status");
                return;
            }
            
            int appointmentId = Integer.parseInt(appointmentIdParam);

            TestDriveScheduleDTO updatedSchedule = scheduleService.UpdateTestDriveSchedule(appointmentId, newStatus);
            
            if (updatedSchedule == null) {
                ResponseUtils.error(resp, "Failed to update status. ID may be invalid or new_status is invalid.");
            } else {
                ResponseUtils.success(resp, "Schedule status updated successfully", updatedSchedule);
            }
        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid format for appointment_id.");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Error during status update: " + e.getMessage());
        }
    }
}