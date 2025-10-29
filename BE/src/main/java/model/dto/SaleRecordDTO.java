package model.dto;

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author Admin
 */
public class SaleRecordDTO {
    private int saleId;
    private int dealerStaffId;
    private String saleDate;
    private double saleAmount;

    public SaleRecordDTO() {
    }

    public SaleRecordDTO(int saleId, int dealerStaffId, String saleDate, double saleAmount) {
        this.saleId = saleId;
        this.dealerStaffId = dealerStaffId;
        this.saleDate = saleDate;
        this.saleAmount = saleAmount;
    }

   
    public int getSaleId() {
        return saleId;
    }

    public void setSaleId(int saleId) {
        this.saleId = saleId;
    }

    public int getDealerStaffId() {
        return dealerStaffId;
    }

    public void setDealerStaffId(int dealerStaffId) {
        this.dealerStaffId = dealerStaffId;
    }

    public String getSaleDate() {
        return saleDate;
    }

    public void setSaleDate(String saleDate) {
        this.saleDate = saleDate;
    }

    public double getSaleAmount() {
        return saleAmount;
    }

    public void setSaleAmount(double saleAmount) {
        this.saleAmount = saleAmount;
    }
}
