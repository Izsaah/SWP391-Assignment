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
@WebServlet("/api/staff/updateConfirmation")
public class UpdateConfirmationController extends HttpServlet {

    private final ConfirmationForSpecialOrder confirmationService = new ConfirmationForSpecialOrder();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        
        try {
            // 1. Get required parameters
            int confirmationId = Integer.parseInt(req.getParameter("confirmation_id"));
            String newStatus = req.getParameter("new_status");
            
            // 2. Call the service method
            ConfirmationDTO updatedConfirmation = confirmationService.UpdateConfirmation(
                    confirmationId,
                    newStatus
            );

            // 3. Send response
            if (updatedConfirmation == null) {
                // This means either the ID was bad, the update failed, or newStatus was blank (handled by service)
                ResponseUtils.error(resp, "Failed to update confirmation status. ID may be invalid or new_status is blank.");
            } else {
                ResponseUtils.success(resp, "Confirmation status updated successfully", updatedConfirmation);
            }
        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid format for confirmation_id.");
        } catch (Exception e) {
            ResponseUtils.error(resp, "Database error during status update: " + e.getMessage());
        }
    }
}