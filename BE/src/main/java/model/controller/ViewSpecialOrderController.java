package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import model.dto.SpecialOrderDTO;
import model.service.ConfirmationForSpecialOrder;
import utils.ResponseUtils;

/**
 *
 * @author ACER
 */
@WebServlet("/api/staff/viewSpecialOrder")
public class ViewSpecialOrderController extends HttpServlet {
    
    // Using ConfirmationForSpecialOrder because its 'confirmation' method fetches the order + DTO
    private final ConfirmationForSpecialOrder confirmationService = new ConfirmationForSpecialOrder();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            // 1. Get parameter (special_order_id is required)
            int specialOrderId = Integer.parseInt(req.getParameter("special_order_id"));

            // 2. Call the service method
            SpecialOrderDTO order = confirmationService.confirmation(specialOrderId);

            // 3. Send response
            if (order == null) {
                ResponseUtils.error(resp, "Special order not found or service failed.");
            } else {
                ResponseUtils.success(resp, "Special order details retrieved", order);
            }
        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid format for special_order_id.");
        } catch (Exception e) {
            ResponseUtils.error(resp, "Error retrieving order details: " + e.getMessage());
        }
    }
}