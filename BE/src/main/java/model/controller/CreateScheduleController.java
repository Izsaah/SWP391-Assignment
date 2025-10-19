/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
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
@WebServlet("/api/staff/createSchedule")
public class CreateScheduleController extends HttpServlet {

    private final TestDriveScheduleService CTDService = new TestDriveScheduleService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(req);

            String customerIdStr = params.get("customer_id").toString();
            String serialId = params.get("serial_id").toString();
            String scheduleId = params.get("schedule_id").toString();
            String date = params.get("date").toString();
            String status = params.get("status").toString();

            if (customerIdStr == null || customerIdStr.trim().isEmpty() ||
                serialId == null || serialId.trim().isEmpty() ||
                date == null || date.trim().isEmpty()) {
                ResponseUtils.error(resp, "Customer ID, Serial ID, and Date are required");
                return;
            }

            int customerId = Integer.parseInt(customerIdStr);

            TestDriveScheduleDTO schedule = CTDService.createTestDriveSchedule(customerId, serialId, date);
            
            if (schedule != null) {
                ResponseUtils.success(resp, "Test Drive Schedule created successfully", schedule);
            } else {
                ResponseUtils.error(resp, "Failed to create test drive schedule");
            }

        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid format for Customer ID");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Error creating schedule: " + e.getMessage());
        }
    }
}