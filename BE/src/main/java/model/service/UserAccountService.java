/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import model.dao.UserAccountDAO;
import model.dto.RoleDTO;
import model.dto.UserAccountDTO;

/**
 *
 * @author ACER
 */
public class UserAccountService {

    private UserAccountDAO UDao = new UserAccountDAO();

    public UserAccountDTO HandlingLogin(String email, String password) {
        UserAccountDTO user = UDao.login(email, password);

        // FIX: Check for null user immediately after the login attempt.
        if (user == null) {
            return null;
        }

        // Line 21 is now safe because user is guaranteed not to be null
        List<RoleDTO> roles = UDao.getUserRoles(user.getUserId());
        user.setRoles(roles);

        return user;
    }

 

    public List<String> getAllRoles(UserAccountDTO user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return Collections.singletonList("USER"); 
        }

        return user.getRoles().stream()
                .map(r -> r.getRoleName())
                .collect(Collectors.toList());  
    }

}
