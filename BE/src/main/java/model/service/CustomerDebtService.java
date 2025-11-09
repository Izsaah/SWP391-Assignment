package model.service;

import java.util.List;
import model.dao.OrderDAO;
import model.dao.OrderDetailDAO;
import model.dao.PaymentDAO;
import model.dto.OrderDTO;
import model.dto.OrderDetailDTO;
import model.dto.PaymentDTO;

public class CustomerDebtService {
    
    private final OrderDAO orderDAO = new OrderDAO();
    private final OrderDetailDAO orderDetailDAO = new OrderDetailDAO();
    private final PaymentDAO paymentDAO = new PaymentDAO();

    public double getDebtByCustomerId(int customerId) {
        try {
            double totalDebt = 0.0;
            
            // Get all orders from this customer
            List<OrderDTO> orders = orderDAO.getByCustomerId(customerId);
            if (orders == null || orders.isEmpty()) {
                return 0;
            }

            for (OrderDTO order : orders) {
                // Skip cancelled orders - they should not contribute to debt
                String orderStatus = order.getStatus();
                if (orderStatus != null && orderStatus.equalsIgnoreCase("cancelled")) {
                    continue;
                }
                
                // Get order detail(s)
                List<OrderDetailDTO> details = orderDetailDAO.getOrderDetailListByOrderId(order.getOrderId());
                if (details == null || details.isEmpty()) {
                    continue;
                }

                double orderTotal = 0.0;
                for (OrderDetailDTO detail : details) {
                    double quantity = 0;
                    try {
                        String quantityStr = detail.getQuantity();
                        if (quantityStr != null && !quantityStr.trim().isEmpty()) {
                            quantity = Double.parseDouble(quantityStr.trim());
                            // Validate quantity is positive
                            if (quantity <= 0) {
                                System.err.println("Invalid quantity (<= 0) for order detail ID: " + detail.getOrderDetailId());
                                continue; // Skip this detail
                            }
                        } else {
                            quantity = 1; // default
                        }
                    } catch (NumberFormatException e) {
                        System.err.println("Invalid quantity format for order detail ID: " + detail.getOrderDetailId());
                        continue; // Skip this detail instead of using default
                    }
                    
                    double unitPrice = detail.getUnitPrice();
                    // Validate unit price is positive
                    if (unitPrice <= 0) {
                        System.err.println("Invalid unit price (<= 0) for order detail ID: " + detail.getOrderDetailId());
                        continue; // Skip this detail
                    }
                    
                    orderTotal += quantity * unitPrice;
                }
// Skip if order total is invalid
                if (orderTotal <= 0) {
                    continue;
                }

                // Get payments made for this order
                List<PaymentDTO> payments = paymentDAO.findPaymentByOrderId(order.getOrderId());
                double totalPaid = 0.0;
                if (payments != null && !payments.isEmpty()) {
                    totalPaid = payments.stream()
                            .mapToDouble(PaymentDTO::getAmount)
                            .filter(amount -> amount > 0) // Only count positive payments
                            .sum();
                }

                // Calculate remaining debt = total order value - amount paid
                // Only add to total debt if there's actually outstanding balance
                double remainingDebt = orderTotal - totalPaid;
                if (remainingDebt > 0) {
                    totalDebt += remainingDebt;
                }
                // If totalPaid > orderTotal, it means overpayment - don't subtract from total debt
                // (we don't want negative debt values)
            }

            // Ensure debt is never negative
            return Math.max(0, totalDebt);
        } catch (Exception e) {
            e.printStackTrace();
            return 0.0;
        }
    }
}