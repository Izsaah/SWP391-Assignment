/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import model.dao.CustomerDAO;
import model.dao.SpecialOrderDAO;
import model.dao.UserAccountDAO;
import model.dto.SpecialOrderDTO;

/**
 *
 * @author ACER
 */
public class CreateSpecialOrderService {

    private SpecialOrderDAO SDAO = new SpecialOrderDAO();
    private CustomerDAO CDAO = new CustomerDAO();
    private UserAccountDAO UDAO = new UserAccountDAO();

    public SpecialOrderDTO handlingCreateSpecialOrder(
            int customerId, int dealerStaffId, int modelId, String description, String quantity) {

        SpecialOrderDTO order = new SpecialOrderDTO();
        order.setCustomerId(customerId);
        order.setDealerStaffId(dealerStaffId);
        order.setDealerId(UDAO.getUserById(dealerStaffId).getDealerId());
        order.setModelId(modelId);
        order.setOrderDate(LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        order.setDescription(description);
        order.setQuantity(quantity);

        return SDAO.insert(order);
    }

}
