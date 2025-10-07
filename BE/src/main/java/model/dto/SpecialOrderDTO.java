package model.dto;

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author Admin
 */
public class SpecialOrderDTO {
    private int specialOrderId;
    private int customerId;
    private int dealerStaffId;
    private int dealerId;
    private int modelId;
    private String orderDate;
    private String description;
    private String quantity;
    private ConfirmationDTO confirmation;

    public ConfirmationDTO getConfirmation() {
        return confirmation;
    }

    public void setConfirmation(ConfirmationDTO confirmation) {
        this.confirmation = confirmation;
    }

    public SpecialOrderDTO(int specialOrderId, int customerId, int dealerStaffId, int dealerId, int modelId, String orderDate, String description, String quantity, ConfirmationDTO confirmation) {
        this.specialOrderId = specialOrderId;
        this.customerId = customerId;
        this.dealerStaffId = dealerStaffId;
        this.dealerId = dealerId;
        this.modelId = modelId;
        this.orderDate = orderDate;
        this.description = description;
        this.quantity = quantity;
        this.confirmation = confirmation;
    }
    
    public SpecialOrderDTO() {
    }

    public SpecialOrderDTO(int specialOrderId, int customerId, int dealerStaffId, int dealerId, int modelId, String orderDate, String description, String quantity) {
        this.specialOrderId = specialOrderId;
        this.customerId = customerId;
        this.dealerStaffId = dealerStaffId;
        this.dealerId = dealerId;
        this.modelId = modelId;
        this.orderDate = orderDate;
        this.description = description;
        this.quantity = quantity;
    }

    public int getSpecialOrderId() {
        return specialOrderId;
    }

    public void setSpecialOrderId(int specialOrderId) {
        this.specialOrderId = specialOrderId;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public int getDealerStaffId() {
        return dealerStaffId;
    }

    public void setDealerStaffId(int dealerStaffId) {
        this.dealerStaffId = dealerStaffId;
    }

    public int getDealerId() {
        return dealerId;
    }

    public void setDealerId(int dealerId) {
        this.dealerId = dealerId;
    }

    public int getModelId() {
        return modelId;
    }

    public void setModelId(int modelId) {
        this.modelId = modelId;
    }

    public String getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(String orderDate) {
        this.orderDate = orderDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }
}
