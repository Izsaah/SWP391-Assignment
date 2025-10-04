package model.dto;

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author Admin
 */
public class OrderDTO {
    private int orderId;
    private int customerId;
    private int dealerId;
    private int dealerStaffId;
    private String orderDate;
    private String status;

    public OrderDTO() {
    }

    public OrderDTO(int orderId, int customerId, int dealerId, int dealerStaffId, String orderDate, String status) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.dealerId = dealerId;
        this.dealerStaffId = dealerStaffId;
        this.orderDate = orderDate;
        this.status = status;
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public int getDealerId() {
        return dealerId;
    }

    public void setDealerId(int dealerId) {
        this.dealerId = dealerId;
    }

    public int getDealerStaffId() {
        return dealerStaffId;
    }

    public void setDealerStaffId(int dealerStaffId) {
        this.dealerStaffId = dealerStaffId;
    }

    public String getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(String orderDate) {
        this.orderDate = orderDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
