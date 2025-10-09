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
    
   
    public ConfirmationDTO UpdateConfirmation(int confirmationId, String newStatus) {
        
       
        
        if (newStatus != null && !newStatus.trim().isEmpty()) {
            
           
            return CDAO.updateStatus(confirmationId, newStatus);
        }
        

        return null;
    }
}