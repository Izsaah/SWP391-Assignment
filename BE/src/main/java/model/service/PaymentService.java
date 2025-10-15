/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import model.dao.CustomerDAO;
import model.dao.DealerDAO;
import model.dao.DealerPromotionDAO;
import model.dao.InstallmentPlanDAO;
import model.dao.OrderDAO;
import model.dao.OrderDetailDAO;
import model.dao.PaymentDAO;
import model.dao.UserAccountDAO;
import model.dto.CustomerDTO;
import model.dto.DealerDTO;
import model.dto.InstallmentPlanDTO;
import model.dto.OrderDTO;
import model.dto.OrderDetailDTO;
import model.dto.PaymentDTO;
import model.dto.PromotionDTO;
import model.dto.UserAccountDTO;

/**
 *
 * @author Admin
 */
public class PaymentService {

    private final PaymentDAO paymentDAO = new PaymentDAO();
    private final InstallmentPlanDAO installDAO = new InstallmentPlanDAO();
    private final OrderDAO orderDAO = new OrderDAO();
    private final OrderDetailDAO orderDetailDAO = new OrderDetailDAO();
    private final UserAccountDAO userAccountDAO = new UserAccountDAO();
    private final DealerDAO dealerDAO = new DealerDAO();
    private final DealerPromotionDAO dealerPromoDAO = new DealerPromotionDAO();
    private final CustomerDAO customerDAO = new CustomerDAO();

    public PaymentDTO processPayment(int orderId, String method, InstallmentPlanDTO plan) throws ClassNotFoundException, SQLException {
        OrderDTO order = orderDAO.getById(orderId);
        if (order == null) {
            return null;
        }

        OrderDetailDTO detail = orderDetailDAO.getOrderDetailByOrderId(orderId);
        if (detail == null) {
            return null;
        }

        order.setDetail(detail);

        double totalAmount = 0.0;
        try {
            int quantity = Integer.parseInt(detail.getQuantity());
            double unitPrice = detail.getUnitPrice();
            totalAmount = quantity * unitPrice;
        } catch (NumberFormatException e) {
            return null;
        }

        // Apply promotions
        UserAccountDTO staff = userAccountDAO.getUserById(order.getDealerStaffId());
        if (staff != null) {
            DealerDTO dealer = dealerDAO.GetDealerById(staff.getDealerId());
            if (dealer != null) {
                List<PromotionDTO> promotions = dealerPromoDAO.getPromotionsByDealerId(dealer.getDealerId());

                System.out.println("Promotions loaded: " + promotions.size());

                LocalDate now = LocalDate.now();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

                for (PromotionDTO promo : promotions) {
                    try {
                        if (promo.getStartDate() == null || promo.getEndDate() == null) {
                            continue;
                        }

                        LocalDate start = LocalDate.parse(promo.getStartDate(), formatter);
                        LocalDate end = LocalDate.parse(promo.getEndDate(), formatter);

                        if ((now.isEqual(start) || now.isAfter(start)) && (now.isEqual(end) || now.isBefore(end))) {
                            String discountStr = promo.getDiscountRate();
                            if (discountStr != null && !discountStr.trim().isEmpty()) {
                                discountStr = discountStr.replace("%", "").trim();
                                double discount = Double.parseDouble(discountStr);

                                // Nếu DB lưu 0.1 nghĩa là 10%
                                if (discount > 0 && discount < 1) {
                                    discount = discount * 100;
                                }

                                totalAmount = totalAmount * (1 - discount / 100.0);
                                System.out.println("Applied promotion: " + promo.getDescription()
                                        + ", discount: " + discount + "%, totalAmount now: " + totalAmount);
                            }
                        }
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                }
            }
        }

        PaymentDTO payment = new PaymentDTO();
        payment.setOrderId(orderId);
        payment.setAmount(totalAmount);
        payment.setPaymentDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        payment.setMethod(method != null ? method : "TT");

        boolean paymentCreated = paymentDAO.create(payment);
        if (!paymentCreated) {
            return null;
        }

        if (!"TT".equalsIgnoreCase(method)) {
            if (plan == null) {
                plan = new InstallmentPlanDTO();
                plan.setInterestRate("0");
                plan.setTermMonth("12");
                plan.setStatus("Active");
            }

            if (plan.getMonthlyPay() == null || "0".equals(plan.getMonthlyPay()) || "".equals(plan.getMonthlyPay())) {
                try {
                    int termMonths = 12; // Default
                    if (plan.getTermMonth() != null) {
                        termMonths = Integer.parseInt(plan.getTermMonth());
                    }

                    // Avoid division by zero
                    if (termMonths <= 0) {
                        termMonths = 1;
                    }

                    double monthlyPayment = totalAmount / termMonths;
                    plan.setMonthlyPay(String.valueOf(monthlyPayment));

                } catch (NumberFormatException e) {
                    plan.setMonthlyPay(String.valueOf(totalAmount));
                }
            }

            plan.setPaymentId(payment.getPaymentId());
            InstallmentPlanDTO createdPlan = installDAO.create(plan);
            payment.setInstallmentPlan(createdPlan);
        }

        return payment;
    }

    public InstallmentPlanDTO updateInstallmentPlanStatus(InstallmentPlanDTO plan) {
        try {
            boolean updated = installDAO.updateStatus(plan);
            if (updated) {
                return plan; 
            } else {
                return null; 
            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }

    public PaymentDTO getPaymentByOrderId(int orderId) {
        try {
            return (PaymentDTO) paymentDAO.findPaymentByOrderId(orderId);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("No payment found for Order ID " + orderId + ". Returning null.");
            return null;
        } catch (Exception e) {
            System.err.println("Database or Service error while retrieving payment by Order ID " + orderId + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public List<Map<String, Object>> getCustomersWithActiveInstallments() {
        List<Map<String, Object>> responseList = new ArrayList<>();

        try {
            // Step 1: Get all active/overdue installment plans
            List<InstallmentPlanDTO> plans = installDAO.retrieve("status IN (?, ?)", "Active", "Overdue");
            System.out.println("DEBUG: Found " + (plans != null ? plans.size() : 0) + " Active/Overdue Installment Plans.");

            if (plans != null && !plans.isEmpty()) {
                Set<Integer> addedCustomerIds = new HashSet<>();

                for (InstallmentPlanDTO plan : plans) {
                    PaymentDTO payment = paymentDAO.findPaymentById(plan.getPaymentId());
                    if (payment == null) {
                        System.out.println("WARN: Payment not found (Payment ID: " + plan.getPaymentId() + ")");
                        continue;
                    }

                    OrderDTO order = orderDAO.getById(payment.getOrderId());
                    if (order == null) {
                        System.out.println("WARN: Order not found (Order ID: " + payment.getOrderId() + ")");
                        continue;
                    }

                    int customerId = order.getCustomerId();
                    if (customerId <= 0) {
                        System.out.println("WARN: Invalid Customer ID: " + customerId);
                        continue;
                    }

                    List<CustomerDTO> customerList = customerDAO.findById(customerId);
                    if (customerList == null || customerList.isEmpty()) {
                        System.out.println("WARN: Customer not found (Customer ID: " + customerId + ")");
                        continue;
                    }

                    CustomerDTO customer = customerList.get(0);

                    double monthlyPay = 0.0;
                    int termMonth = 0;

                    try {
                        monthlyPay = Double.parseDouble(plan.getMonthlyPay());
                    } catch (NumberFormatException e) {
                        monthlyPay = 0.0;
                    }

                    try {
                        termMonth = Integer.parseInt(plan.getTermMonth());
                    } catch (NumberFormatException e) {
                        termMonth = 0;
                    }

                    double outstanding = monthlyPay * termMonth;
                    if (outstanding < 0) {
                        outstanding = 0;
                    }

                    if (!addedCustomerIds.contains(customerId)) {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("customerId", customer.getCustomerId());
                        map.put("name", customer.getName());
                        map.put("address", customer.getAddress());
                        map.put("email", customer.getEmail());
                        map.put("phoneNumber", customer.getPhoneNumber());
                        map.put("outstandingAmount", outstanding);

                        responseList.add(map);
                        addedCustomerIds.add(customerId);

                        System.out.println("INFO: Added Customer ID " + customer.getCustomerId()
                                + " | Outstanding: " + outstanding);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println("DEBUG: Finished processing. Total unique customers found: " + responseList.size());
        return responseList;
    }

}
