/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.util.List;
import java.util.Map;
import model.dao.DealerDAO;
import model.dao.DealerPromotionDAO;
import model.dto.DealerDTO;
import model.dto.PromotionDTO;

/**
 *
 * @author ACER
 */
public class PromotionForDealerService {
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
    
    public boolean createPromotionForDealer(int promoId, int dealerId) {
        if (promoId <= 0 || dealerId <= 0) {
            throw new IllegalArgumentException("Invalid promoId or dealerId");
        }
        return dealerPromotionDAO.createPromotionForDealer(promoId, dealerId);
    }

    public boolean updatePromotionForDealer(int promoId, int dealerId, int newPromoId) {
        if (promoId <= 0 || dealerId <= 0 || newPromoId <= 0) {
            throw new IllegalArgumentException("Invalid promoId, dealerId, or newPromoId");
        }
        return dealerPromotionDAO.updatePromotionForDealer(promoId, dealerId, newPromoId);
    }
    
    public List<Map<String, Object>> getAllPromotionsWithDealers() {
        return dealerPromotionDAO.getAllPromotionsWithDealers();
    }

}
