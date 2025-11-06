/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import model.dao.CustomerDAO;
import model.dao.FeedbackDAO;
import model.dto.CustomerDTO;
import model.dto.FeedbackDTO;

/**
 *
 * @author ACER
 */
public class FeedBackService {

    private final FeedbackDAO FDAO = new FeedbackDAO();
    private final CustomerDAO CDAO = new CustomerDAO();

    public FeedbackDTO handlingCreateFeedBack(int customer_id, int order_id, String type, String content, String status) {
        if (!status.equalsIgnoreCase("RESOLVED")) {
            status = "PENDING";
        }
        String created_at = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        return FDAO.create(customer_id, order_id, type, content, status, created_at);
    }

    public boolean deleteFeedBack(int feedback_id) {
        return FDAO.delete(feedback_id);
    }

    public List<CustomerDTO> getAllFeedBackFromCustomerName(String name) {
        List<CustomerDTO> customer = CDAO.findByName(name);
        if (customer == null || customer.isEmpty()) {
            return new ArrayList<>();
        }
        for (CustomerDTO tmp : customer) {
            int Customerid = tmp.getCustomerId();
            List<FeedbackDTO> feedbacks = FDAO.getFeedbackByCustomerId(Customerid);
            if (feedbacks != null) {
                tmp.setFeedBackList(feedbacks);
            }
        }
        return customer;
    }

    public CustomerDTO getFeedbackByCustomerId(int customerId) {
        try {
            // Get customer by ID
            List<CustomerDTO> customerList = CDAO.findById(customerId);

            if (customerList == null || customerList.isEmpty()) {
                return null;
            }

            // Get the first customer (should be only one with specific ID)
            CustomerDTO customer = customerList.get(0);

            // Get all feedbacks for this customer
            List<FeedbackDTO> feedbacks = FDAO.getFeedbackByCustomerId(customerId);

            if (feedbacks != null) {
                customer.setFeedBackList(feedbacks);
            } else {
                customer.setFeedBackList(new ArrayList<>());
            }

            return customer;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    public CustomerDTO getFeedbackByCustomerId(int customerId) {
        try {
            // Get customer by ID
            List<CustomerDTO> customerList = CDAO.findById(customerId);

            if (customerList == null || customerList.isEmpty()) {
                return null;
            }

            // Get the first customer (should be only one with specific ID)
            CustomerDTO customer = customerList.get(0);

            // Get all feedbacks for this customer
            List<FeedbackDTO> feedbacks = FDAO.getFeedbackByCustomerId(customerId);

            if (feedbacks != null) {
                customer.setFeedBackList(feedbacks);
            } else {
                customer.setFeedBackList(new ArrayList<>());
            }

            return customer;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
  
}
