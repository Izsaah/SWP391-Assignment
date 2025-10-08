package model.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author Admin
 */
public class UserAccountDTO {
    private int userId;
    @JsonIgnore
    private int customerId;
    private int dealerId;   
    @JsonIgnore
    private String password;
    private String email;
    private String username;
    private String phoneNumber;
    private List<RoleDTO> roles;

    public UserAccountDTO() {
    }

    public UserAccountDTO(int userId, int customerId, int dealerId, String email, String username, String phoneNumber, List<RoleDTO> roles) {
        this.userId = userId;
        this.customerId = customerId;
        this.dealerId = dealerId;
        this.email = email;
        this.username = username;
        this.phoneNumber = phoneNumber;
        this.roles = roles;
    }

    public UserAccountDTO(int userId, int customerId, int dealerId, String email, String username, String phoneNumber) {
        this.userId = userId;
        this.customerId = customerId;
        this.dealerId = dealerId;
        this.email = email;
        this.username = username;
        this.phoneNumber = phoneNumber;
    }
    public UserAccountDTO(int userId, int dealerId, String email, String username, String phoneNumber) {
        this.userId = userId;
        this.dealerId = dealerId;
        this.email = email;
        this.username = username;
        this.phoneNumber = phoneNumber;
    }

    public List<RoleDTO> getRoles() {
        return roles;
    }

    public void setRoles(List<RoleDTO> roles) {
        this.roles = roles;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }


}
