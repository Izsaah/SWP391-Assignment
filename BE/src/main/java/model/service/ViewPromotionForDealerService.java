/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.util.List;
import model.dao.DealerDAO;
import model.dao.DealerPromotionDAO;
import model.dao.PromotionDAO;
import model.dto.DealerDTO;
import model.dto.PromotionDTO;
import model.dto.VehicleModelDTO;
import model.dto.VehicleVariantDTO;

/**
 *
 * @author ACER
 */
public class ViewPromotionForDealerService {
   private DealerDAO dealerDAO = new DealerDAO();
    private DealerPromotionDAO dealerPromotionDAO = new DealerPromotionDAO();

    public DealerDTO HandlingViewPromotionForDealer(int dealerId) {
        DealerDTO dealer = dealerDAO.GetDealerById(dealerId);
        if (dealer == null) return null;

        try {
            List<PromotionDTO> promotions = dealerPromotionDAO.getPromotionsByDealerId(dealerId);
            dealer.setPromotion(promotions);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }

        return dealer;
    }

}
