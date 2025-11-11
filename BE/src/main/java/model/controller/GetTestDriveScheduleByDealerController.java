/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import model.dto.CustomerDTO;
import model.dto.TestDriveScheduleDTO;
import model.dto.UserAccountDTO;
import model.service.TestDriveScheduleService;
import model.service.UserAccountService;
import utils.JwtUtil;
import utils.RequestUtils;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/getTestDriveScheduleByDealerId")
public class GetTestDriveScheduleByDealerController extends HttpServlet {
    private final TestDriveScheduleService testDriveScheduleService = new TestDriveScheduleService();
    private final UserAccountService userAccountService = new UserAccountService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            // Extract token and get dealer staff ID from JWT
            String token = JwtUtil.extractToken(req);
            int dealerStaffId = JwtUtil.extractUserId(token);

            // Get dealer staff user account using service layer
            UserAccountDTO staff = userAccountService.getDealerStaffById(dealerStaffId);

            if (staff == null) {
                ResponseUtils.error(resp, "Staff account not found");
                return;
            }

            // Get dealer ID from staff account
            int dealerId = staff.getDealerId();

            if (dealerId <= 0) {
                ResponseUtils.error(resp, "No dealer associated with this staff account");
                return;
            }

            // Get all customers with their test drive schedules for this dealer
            List<CustomerDTO> schedules = testDriveScheduleService.getAllTestDriveSchedulesByDealer(dealerId);

            if (schedules != null && !schedules.isEmpty()) {
                ResponseUtils.success(resp, "All test drive schedules retrieved successfully", schedules);
            } else {
                ResponseUtils.error(resp, "No test drive schedules found for your dealership");
            }

        } catch (utils.AuthException e) {
            ResponseUtils.error(resp, "Authentication failed: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "An error occurred while retrieving test drive schedules: " + e.getMessage());
        }
    }
}
