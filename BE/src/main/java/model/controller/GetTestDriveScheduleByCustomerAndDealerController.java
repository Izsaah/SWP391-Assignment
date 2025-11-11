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
import java.util.Map;
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
@WebServlet("/api/staff/getTestDriveScheduleByCustomer")
public class GetTestDriveScheduleByCustomerAndDealerController extends HttpServlet {
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
            
            // Extract parameters using RequestUtils
            Map<String, Object> params = RequestUtils.extractParams(req);
            
            // Get customer ID from parameters
            Object customerIdObj = params.get("customer_id");
            String customerIdParam = (customerIdObj == null) ? null : customerIdObj.toString();
            
            if (customerIdParam == null || customerIdParam.trim().isEmpty()) {
                ResponseUtils.error(resp, "Customer ID is required");
                return;
            }
            
            int customerId = Integer.parseInt(customerIdParam);
            
            if (customerId <= 0) {
                ResponseUtils.error(resp, "Invalid customer ID");
                return;
            }
            
            // Get test drive schedule by customer and dealer using service layer
            TestDriveScheduleDTO schedule = testDriveScheduleService
                    .getTestDriveScheduleByCustomerAndDealer(customerId, dealerId);
            
            if (schedule != null) {
                ResponseUtils.success(resp, "Test drive schedule retrieved successfully", schedule);
            } else {
                ResponseUtils.error(resp, "No test drive schedule found for this customer at your dealership");
            }
            
        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid customer ID format");
        } catch (utils.AuthException e) {
            ResponseUtils.error(resp, "Authentication failed: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "An error occurred while retrieving test drive schedule: " + e.getMessage());
        }
    }
}
