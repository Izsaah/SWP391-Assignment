package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import model.dto.TestDriveScheduleDTO;
import model.service.TestDriveScheduleService;
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
            // 1. Get required parameters
            int appointmentId = Integer.parseInt(req.getParameter("appointment_id"));
            String newStatus = req.getParameter("new_status");
            
            // 2. Call the service method
            TestDriveScheduleDTO updatedSchedule = scheduleService.UpdateTestDriveSchedule(appointmentId, newStatus);
               

            // 3. Send response
            if (updatedSchedule == null) {
                // This means either the ID was bad, the update failed, or newStatus was blank (handled by service)
                ResponseUtils.error(resp, "Failed to update confirmation status. ID may be invalid or new_status is blank.");
            } else {
                ResponseUtils.success(resp, "Confirmation status updated successfully", updatedSchedule);
            }
        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid format for confirmation_id.");
        } catch (Exception e) {
            ResponseUtils.error(resp, "Database error during status update: " + e.getMessage());
        }
    }
}