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

    public List<Map<String, Object>> getCustomersWithActiveInstallments() {
        List<Map<String, Object>> responseList = new ArrayList<>();
        try {
            List<InstallmentPlanDTO> plans = installDAO.getActiveOrOverduePlans();
            if (plans != null && !plans.isEmpty()) {
                Set<Integer> addedCustomerIds = new HashSet<>();
                for (InstallmentPlanDTO plan : plans) {
                    PaymentDTO payment = paymentDAO.findPaymentById(plan.getPaymentId());
                    if (payment == null) {
                        continue;
                    }

                    OrderDTO order = orderDAO.getById(payment.getOrderId());
                    if (order == null) {
                        continue;
                    }

                    int customerId = order.getCustomerId();
                    if (customerId <= 0 || addedCustomerIds.contains(customerId)) {
                        continue;
                    }

                    List<CustomerDTO> customerList = customerDAO.findById(customerId);
                    if (customerList == null || customerList.isEmpty()) {
                        continue;
                    }

                    CustomerDTO customer = customerList.get(0);
                    double monthlyPay = 0.0;
                    int termMonth = 0;
                    try {
                        monthlyPay = Double.parseDouble(plan.getMonthlyPay());
                    } catch (NumberFormatException e) {
                    }
                    try {
                        termMonth = Integer.parseInt(plan.getTermMonth());
                    } catch (NumberFormatException e) {
                    }

                    double outstanding = Math.max(0, monthlyPay * termMonth);

                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("customerId", customer.getCustomerId());
                    map.put("name", customer.getName());
                    map.put("address", customer.getAddress());
                    map.put("email", customer.getEmail());
                    map.put("phoneNumber", customer.getPhoneNumber());
                    map.put("outstandingAmount", outstanding);

                    responseList.add(map);
                    addedCustomerIds.add(customerId);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return responseList;
    }

    public List<Map<String, Object>> getCompletedPayments() {
        List<Map<String, Object>> responseList = new ArrayList<>();
        try {
            // Lấy tất cả payments với method = "TT" (trả xong - full payment)
            List<PaymentDTO> payments = paymentDAO.retrieve("method = ?", "TT");

            if (payments != null && !payments.isEmpty()) {
                for (PaymentDTO payment : payments) {
                    try {
                        // Lấy Order từ payment
                        OrderDTO order = orderDAO.getById(payment.getOrderId());
                        if (order == null) {
                            continue;
                        }
                        // Lấy Customer từ order
                        int customerId = order.getCustomerId();
                        List<CustomerDTO> customerList = customerDAO.findById(customerId);
                        if (customerList == null || customerList.isEmpty()) {
                            continue;
                        }
                        CustomerDTO customer = customerList.get(0);

                        // Lấy OrderDetail để có thể lấy vehicle info sau này
                        OrderDetailDTO orderDetail = orderDetailDAO.getOrderDetailByOrderId(order.getOrderId());

                        // Lấy VehicleModel để có tên xe
                        String vehicleName = "N/A";
                        try {
                            VehicleModelDAO vehicleModelDAO = new VehicleModelDAO();
                            List<VehicleModelDTO> models = vehicleModelDAO.retrieve("model_id = ?", order.getModelId());
                            if (models != null && !models.isEmpty()) {
                                vehicleName = models.get(0).getModelName();
                            }
                        } catch (Exception e) {
                            System.err.println("Error getting vehicle model: " + e.getMessage());
                        }
                        // Tạo map response
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("paymentId", payment.getPaymentId());
                        map.put("orderId", payment.getOrderId());
                        map.put("customerId", customer.getCustomerId());
                        map.put("customerName", customer.getName());
                        map.put("customerEmail", customer.getEmail());
                        map.put("phoneNumber", customer.getPhoneNumber());
                        map.put("amount", payment.getAmount());
                        map.put("paymentDate", payment.getPaymentDate());
                        map.put("method", payment.getMethod());
                        map.put("vehicleName", vehicleName);
                        map.put("serialId", orderDetail != null ? orderDetail.getSerialId() : "N/A");
                        responseList.add(map);
                    } catch (Exception e) {
                        System.err.println("Error processing payment ID " + payment.getPaymentId() + ": " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return responseList;
    }
}
