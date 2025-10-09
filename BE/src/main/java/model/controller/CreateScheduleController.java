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
import model.dto.SpecialOrderDTO;
import model.dto.TestDriveScheduleDTO;
import model.service.CreateSpecialOrderService;
import model.service.CreateTestDriveScheduleService;
import utils.JwtUtil;
import utils.ResponseUtils;

/**
 *
 * @author ACER
 */
@WebServlet("/api/staff/createSchedule")
public class CreateScheduleController extends HttpServlet {

    private final CreateTestDriveScheduleService CTDService = new CreateTestDriveScheduleService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
              
        int customerId = Integer.parseInt(req.getParameter("customer_id"));
        int modelId = Integer.parseInt(req.getParameter("model_id"));

        String schedule_id = req.getParameter("schedule_id");// Write a schedule id gen
        String date = req.getParameter("date");
        String status=req.getParameter("status");
        TestDriveScheduleDTO schedule = CTDService.createTestDriveSchedule( customerId, modelId, schedule_id, date, status);
        if (schedule == null) {
            ResponseUtils.error(resp, "Failed to create special order");
        } else {
            ResponseUtils.success(resp, "Special order created", schedule);
        }
    }

}
