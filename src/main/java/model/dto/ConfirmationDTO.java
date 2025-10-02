package model.dto;

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author Admin
 */
public class ConfirmationDTO {
    private int confirmationId;
    private int userId;
    private int specialOrderId;
    private String agreement;
    private String status;

    public ConfirmationDTO() {
    }

    public ConfirmationDTO(int confirmationId, int userId, int specialOrderId, String agreement, String status) {
        this.confirmationId = confirmationId;
        this.userId = userId;
        this.specialOrderId = specialOrderId;
        this.agreement = agreement;
        this.status = status;
    }

    public int getConfirmationId() {
        return confirmationId;
    }

    public void setConfirmationId(int confirmationId) {
        this.confirmationId = confirmationId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getSpecialOrderId() {
        return specialOrderId;
    }

    public void setSpecialOrderId(int specialOrderId) {
        this.specialOrderId = specialOrderId;
    }

    public String getAgreement() {
        return agreement;
    }

    public void setAgreement(String agreement) {
        this.agreement = agreement;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
