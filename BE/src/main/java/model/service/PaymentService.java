package model.service;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import model.dao.*;
import model.dto.*;

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
        System.out.println("DEBUG: Starting payment processing for order_id = " + orderId);

        OrderDTO order = orderDAO.getById(orderId);
        if (order == null) {
            System.err.println("ERROR: Order not found for order_id = " + orderId);
            throw new IllegalArgumentException("Order not found for order_id = " + orderId);
        }
        System.out.println("DEBUG: Order found - customer_id = " + order.getCustomerId());

        // Check if customer ID is valid (not 0)
        if (order.getCustomerId() <= 0) {
            System.err.println("ERROR: Invalid customer ID (" + order.getCustomerId() + ") for order: " + orderId);
            throw new IllegalArgumentException("Invalid customer ID for order: " + orderId);
        }

        // Check if payment already exists
        System.out.println("DEBUG: Checking for existing payment...");
        PaymentDTO existingPayment = paymentDAO.findPaymentByOrderId(orderId);
        if (existingPayment != null) {
            System.err.println("ERROR: Payment already exists for Order ID: " + orderId + ", Payment ID: " + existingPayment.getPaymentId());
            throw new IllegalStateException("Payment already exists for Order ID: " + orderId);
        }
        System.out.println("DEBUG: No existing payment found");

        List<OrderDetailDTO> detail = orderDetailDAO.getOrderDetailListByOrderId(orderId);
        if (detail == null) {
            return null;
        }
        order.setDetails(detail);

        double totalAmount = 0.0;
        for (OrderDetailDTO d : detail) {
            try {
                int quantity = Integer.parseInt(d.getQuantity());
                double unitPrice = d.getUnitPrice();
                totalAmount += quantity * unitPrice;
            } catch (NumberFormatException e) {
                e.printStackTrace();
                return null;
            }
        }

        // Apply promotions
        UserAccountDTO staff = userAccountDAO.getUserById(order.getDealerStaffId());
        if (staff != null) {
            DealerDTO dealer = dealerDAO.GetDealerById(staff.getDealerId());
            if (dealer != null) {
                List<PromotionDTO> promotions = dealerPromoDAO.getPromotionsByDealerId(dealer.getDealerId());
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
                                if (discount > 0 && discount < 1) {
                                    discount = discount * 100;
                                }
                                totalAmount = totalAmount * (1 - discount / 100.0);
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
                    int termMonths = 12;
                    if (plan.getTermMonth() != null) {
                        termMonths = Integer.parseInt(plan.getTermMonth());
                    }
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
            boolean updated = installDAO.updateStatus(plan); // updates status and term_month
            if (updated) {
                // Reload the full updated record from DB
                return installDAO.findById(plan.getPlanId());
            }
            return null;
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }

    public PaymentDTO getPaymentByOrderId(int orderId) {
        try {
            return paymentDAO.findPaymentById(orderId);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("No payment found for Order ID " + orderId);
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<Map<String, Object>> getCustomersWithActiveInstallmentsByDealer(int dealerId) {
        List<Map<String, Object>> responseList = new ArrayList<>();
        try {
            List<InstallmentPlanDTO> plans = installDAO.getActiveOrOverduePlans();
            if (plans == null || plans.isEmpty()) {
                return responseList;
            }

            for (InstallmentPlanDTO plan : plans) {
                PaymentDTO payment = paymentDAO.findPaymentById(plan.getPaymentId());
                if (payment == null) {
                    continue;
                }

                OrderDTO order = orderDAO.getById(payment.getOrderId());
                if (order == null) {
                    continue;
                }

                // Check if order belongs to the dealer
                // Get dealer staff who processed this order
                UserAccountDTO dealerStaff = userAccountDAO.getUserById(order.getDealerStaffId());
                if (dealerStaff == null || dealerStaff.getDealerId() != dealerId) {
                    continue; // Skip orders not from this dealer
                }

                int customerId = order.getCustomerId();
                if (customerId <= 0) {
                    continue;
                }

                List<CustomerDTO> customerList = customerDAO.findById(customerId);
                if (customerList == null || customerList.isEmpty()) {
                    continue;
                }
                CustomerDTO customer = customerList.get(0);

                // Parse values
                double monthlyPay = 0.0;
                int remainingTermMonth = 0;

                try {
                    monthlyPay = Double.parseDouble(plan.getMonthlyPay());
                } catch (NumberFormatException e) {
                    System.err.println("Invalid monthlyPay for plan " + plan.getPlanId());
                }

                try {
                    remainingTermMonth = Integer.parseInt(plan.getTermMonth());
                } catch (NumberFormatException e) {
                    System.err.println("Invalid termMonth for plan " + plan.getPlanId());
                }

                // Get the original payment amount (this is the principal)
                double originalPrincipal = payment.getAmount();

                // Calculate original term months from principal and monthly payment
                int originalTermMonth = 0;
                if (monthlyPay > 0) {
                    originalTermMonth = (int) Math.round(originalPrincipal / monthlyPay);
                } else {
                    originalTermMonth = remainingTermMonth; // Fallback
                }

                // Ensure originalTermMonth is at least remainingTermMonth
                if (originalTermMonth < remainingTermMonth) {
                    originalTermMonth = remainingTermMonth;
                }

                // Calculate total amount (total commitment)
                double totalAmountWithInterest = monthlyPay * originalTermMonth;

                // Calculate outstanding (what's left to pay)
                double outstanding = monthlyPay * remainingTermMonth;

                // Calculate paid amount (what's been paid so far)
                int paidMonths = originalTermMonth - remainingTermMonth;
                double paidAmount = monthlyPay * paidMonths;

                // Ensure non-negative values
                outstanding = Math.max(0, outstanding);
                paidAmount = Math.max(0, paidAmount);

                // If remaining term is 0, plan is fully paid
                if (remainingTermMonth <= 0) {
                    outstanding = 0.0;
                    paidAmount = totalAmountWithInterest;
                }

                // Debug logging
                System.out.println("DEBUG: Customer " + customer.getCustomerId() + " (Dealer: " + dealerId + ")");
                System.out.println("  Monthly Pay: " + monthlyPay);
                System.out.println("  Original Term Months (calculated): " + originalTermMonth);
                System.out.println("  Remaining Term Months: " + remainingTermMonth);
                System.out.println("  Paid Months: " + paidMonths);
                System.out.println("  Total Amount: " + totalAmountWithInterest);
                System.out.println("  Outstanding: " + outstanding);
                System.out.println("  Paid Amount: " + paidAmount);

                Map<String, Object> map = new LinkedHashMap<>();
                map.put("customerId", customer.getCustomerId());
                map.put("name", customer.getName());
                map.put("address", customer.getAddress());
                map.put("email", customer.getEmail());
                map.put("phoneNumber", customer.getPhoneNumber());
                map.put("planId", plan.getPlanId());
                map.put("interestRate", plan.getInterestRate());
                map.put("termMonth", plan.getTermMonth());
                map.put("monthlyPay", plan.getMonthlyPay());
                map.put("status", plan.getStatus());
                map.put("paymentId", payment.getPaymentId());
                map.put("orderId", payment.getOrderId());
                map.put("totalAmount", totalAmountWithInterest);
                map.put("paymentDate", payment.getPaymentDate());
                map.put("method", payment.getMethod());
                map.put("outstandingAmount", outstanding);
                map.put("paidAmount", paidAmount);
                map.put("dealerId", dealerId); // Include dealer ID in response

                responseList.add(map);
            }

        } catch (Exception e) {
            System.err.println("ERROR in getCustomersWithActiveInstallmentsByDealer: " + e.getMessage());
            e.printStackTrace();
        }
        return responseList;
    }

    public List<Map<String, Object>> getCustomersWithTTStatusByDealer(int dealerId) {
        List<Map<String, Object>> responseList = new ArrayList<>();
        try {
            List<PaymentDTO> allPayments = paymentDAO.getAllPayment();
            if (allPayments == null || allPayments.isEmpty()) {
                return responseList;
            }

            for (PaymentDTO payment : allPayments) {
                if (!"TT".equalsIgnoreCase(payment.getMethod())) {
                    continue;
                }

                OrderDTO order = orderDAO.getById(payment.getOrderId());
                if (order == null) {
                    continue;
                }

                // 🔍 Check dealer ownership (same logic as installment)
                UserAccountDTO dealerStaff = userAccountDAO.getUserById(order.getDealerStaffId());
                if (dealerStaff == null || dealerStaff.getDealerId() != dealerId) {
                    continue; // skip if not from this dealer
                }

                int customerId = order.getCustomerId();
                if (customerId <= 0) {
                    continue;
                }

                List<CustomerDTO> customerList = customerDAO.findById(customerId);
                if (customerList == null || customerList.isEmpty()) {
                    continue;
                }

                CustomerDTO customer = customerList.get(0);

                // Get order details for calculated total
                List<OrderDetailDTO> orderDetails = orderDetailDAO.getOrderDetailListByOrderId(payment.getOrderId());
                double calculatedTotal = 0.0;
                if (orderDetails != null && !orderDetails.isEmpty()) {
                    for (OrderDetailDTO detail : orderDetails) {
                        try {
                            int quantity = Integer.parseInt(detail.getQuantity());
                            double unitPrice = detail.getUnitPrice();
                            calculatedTotal += quantity * unitPrice;
                        } catch (NumberFormatException e) {
                            e.printStackTrace();
                        }
                    }
                }

                double totalAmount = payment.getAmount();

                Map<String, Object> map = new LinkedHashMap<>();
                map.put("customerId", customer.getCustomerId());
                map.put("name", customer.getName());
                map.put("address", customer.getAddress());
                map.put("email", customer.getEmail());
                map.put("phoneNumber", customer.getPhoneNumber());
                map.put("paymentId", payment.getPaymentId());
                map.put("orderId", payment.getOrderId());
                map.put("totalAmount", totalAmount);
                map.put("paymentDate", payment.getPaymentDate());
                map.put("method", payment.getMethod());
                map.put("outstandingAmount", 0.0);
                map.put("paidAmount", totalAmount);
                map.put("dealerId", dealerId); // include dealer ID in response
                responseList.add(map);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return responseList;
    }

}
