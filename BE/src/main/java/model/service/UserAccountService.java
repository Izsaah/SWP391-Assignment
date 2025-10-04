/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import model.dao.UserAccountDAO;
import model.dto.UserAccountDTO;

/**
 *
 * @author ACER
 */
public class UserAccountService {
     private UserAccountDAO UDao;
     
    public UserAccountDTO HandlingLogin(String username, String password) {
    return UDao.login(username, password); // return user or null
    }


}
