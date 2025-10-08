package model.service;

import java.sql.SQLException;
import model.dao.ConfirmationDAO;
import model.dao.SpecialOrderDAO;
import model.dto.ConfirmationDTO;
import model.dto.SpecialOrderDTO;
import utils.ResponseUtils; // Import the utility class

/**
 *
 * @author ACER
 */
public class ConfirmationForSpecialOrder {

    private ConfirmationDAO CDAO = new ConfirmationDAO();
    private SpecialOrderDAO SODAO = new SpecialOrderDAO();
    // 1. Instantiate ResponseUtils to access the instance helper methods
    private ResponseUtils RUtils = new ResponseUtils(); 

    public SpecialOrderDTO confirmation(int id) {
        SpecialOrderDTO order = SODAO.getSpecialOrderBySpecialId(id);
        order.setConfirmation(CDAO.getConfirmationBySpecialOrderId(id));
        return order;
    }

    public ConfirmationDTO CreateConfirmation(int special_order_id, String agreement, String status) throws ClassNotFoundException, SQLException {
        // Corrected logic to prevent NullPointerException
        if (status == null || !status.equalsIgnoreCase("APPROVED")) {
            status = "PENDING";
        }
        return CDAO.insert(special_order_id, agreement, status);
    }
    
    /**
     * Updates the confirmation status only if the newStatus is not blank.
     * @param confirmationId The ID of the confirmation.
     * @param newStatus The status to set.
     * @return The updated ConfirmationDTO, or null if update failed or status was blank.
     */
    public ConfirmationDTO UpdateConfirmation(int confirmationId, String newStatus) {
        
        // Use the same logic as your updateIfNotBlank helper, 
        // as the helper itself requires a DTO to set the value on.
        
        if (newStatus != null && !newStatus.trim().isEmpty()) {
            
            // The check passed, now call the DAO to perform the update.
            // The CDAO.updateStatus method already returns the updated DTO.
            return CDAO.updateStatus(confirmationId, newStatus);
        }
        
        // The newStatus was null or blank, so no update was performed.
        return null;
    }
}