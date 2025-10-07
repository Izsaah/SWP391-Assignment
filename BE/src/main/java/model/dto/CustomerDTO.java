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
public class CustomerDTO {
    private int customerId;
    private String name;
    private String address;
    private String email;
    private String phoneNumber;
    private List<SpecialOrderDTO> specialOrderList;

    public CustomerDTO(int customerId, String name, String address, String email, String phoneNumber, List<SpecialOrderDTO> specialOrderList) {
        this.customerId = customerId;
        this.name = name;
        this.address = address;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.specialOrderList = specialOrderList;
    }

    public List<SpecialOrderDTO> getSpecialOrderList() {
        return specialOrderList;
    }

    public void setSpecialOrderList(List<SpecialOrderDTO> specialOrderList) {
        this.specialOrderList = specialOrderList;
    }
    
    public CustomerDTO() {
    }

    public CustomerDTO(int customerId, String name, String address, String email, String phoneNumber) {
        this.customerId = customerId;
        this.name = name;
        this.address = address;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
