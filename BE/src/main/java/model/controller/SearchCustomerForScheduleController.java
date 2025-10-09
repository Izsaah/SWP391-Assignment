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
import model.dao.CustomerDAO;
import model.dto.CustomerDTO;
import model.service.CreateTestDriveScheduleService;
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/searchCustomerForSchedule")
public class SearchCustomerForScheduleController extends HttpServlet {

    private final CreateTestDriveScheduleService CTDSService=new CreateTestDriveScheduleService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String name = req.getParameter("name");

        if (name == null || name.trim().isEmpty()) {
            ResponseUtils.error(resp, "Customer name is required");
            return;
        }

        List<CustomerDTO> customers = CTDSService.getTestDriveScheduleByCustomer(name);

        if (customers != null && !customers.isEmpty()) {
            ResponseUtils.success(resp, "Customers found", customers);
        } else {
            ResponseUtils.error(resp, "No customers found with name: " + name);
        }
    }
}
