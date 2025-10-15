package model.dto;

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author Admin
 */
public class InstallmentPlanDTO {
    private int planId;
    private int paymentId;
    private String interestRate;
    private String termMonth;
    private String monthlyPay;
    private String status;

    public InstallmentPlanDTO() {
    }

    public InstallmentPlanDTO(int paymentId, String interestRate, String termMonth, String monthlyPay, String status) {
        this.paymentId = paymentId;
        this.interestRate = interestRate;
        this.termMonth = "12";
        this.monthlyPay = monthlyPay;
        this.status = status;
    }

    public InstallmentPlanDTO(int planId, int paymentId, String interestRate, String termMonth, String monthlyPay, String status) {
        this.planId = planId;
        this.paymentId = paymentId;
        this.interestRate = interestRate;
        this.termMonth = "12";
        this.monthlyPay = monthlyPay;
        this.status = status;
    }

    public int getPlanId() {
        return planId;
    }

    public void setPlanId(int planId) {
        this.planId = planId;
    }

    public int getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(int paymentId) {
        this.paymentId = paymentId;
    }

    public String getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(String interestRate) {
        this.interestRate = interestRate;
    }

    public String getTermMonth() {
        return termMonth = "12";
    }

    public void setTermMonth(String termMonth) {
        this.termMonth = termMonth;
    }

    public String getMonthlyPay() {
        return monthlyPay;
    }

    public void setMonthlyPay(String monthlyPay) {
        this.monthlyPay = monthlyPay;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
