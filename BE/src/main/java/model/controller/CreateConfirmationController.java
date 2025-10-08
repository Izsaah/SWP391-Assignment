package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import model.dto.ConfirmationDTO;
import model.service.ConfirmationForSpecialOrder;
import utils.ResponseUtils;

/**
 *
 * @author ACER
 */
@WebServlet("/api/staff/createConfirmation")
public class CreateConfirmationController extends HttpServlet {

    private final ConfirmationForSpecialOrder confirmationService = new ConfirmationForSpecialOrder();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        
        // No staffId/JWT token needed here based on the original service method signature
        // but typically a staffId or userId is needed for audit logs/ownership.
        
        try {
            // 1. Get parameters (special_order_id is required)
            int specialOrderId = Integer.parseInt(req.getParameter("special_order_id"));
            String agreement = req.getParameter("agreement"); // Can be null
            String status = req.getParameter("status");       // Can be null
            
            // 2. Call the service method
            ConfirmationDTO confirmation = confirmationService.CreateConfirmation(
                    specialOrderId,
                    agreement,
                    status
            );

            // 3. Send response
            if (confirmation == null) {
                ResponseUtils.error(resp, "Failed to create confirmation. Check order ID and database.");
            } else {
                ResponseUtils.success(resp, "Confirmation record created successfully", confirmation);
            }
        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid format for special_order_id.");
        } catch (Exception e) {
            // Includes ClassNotFoundException and SQLException from the service
            ResponseUtils.error(resp, "Database error during confirmation creation: " + e.getMessage());
        }
    }
}