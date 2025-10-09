package model.dto;

import java.util.List;

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
    private int modelId;
    private String orderDate;
    private String status;
    private OrderDetailDTO detail;

    public OrderDTO(int orderId, int customerId, int dealerId, int modelId, String orderDate, String status, OrderDetailDTO detail) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.dealerId = dealerId;
        this.modelId = modelId;
        this.orderDate = orderDate;
        this.status = status;
        this.detail = detail;
    }
    
    public OrderDTO(int customerId, int dealerId, int modelId, String orderDate, String status) {
        this.customerId = customerId;
        this.dealerId = dealerId;
        this.modelId = modelId;
        this.orderDate = orderDate;
        this.status = status;;
    }

    public OrderDetailDTO getDetail() {
        return detail;
    }

    public void setDetail(OrderDetailDTO detail) {
        this.detail = detail;
    }

    public OrderDTO() {
    }

    public OrderDTO(int orderId, int customerId, int dealerId, int modelId, String orderDate, String status) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.dealerId = dealerId;
        this.modelId = modelId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
