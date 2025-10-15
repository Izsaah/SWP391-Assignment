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
                        } else {
                            quantity = 1; // default
                        }
                    } catch (NumberFormatException e) {
                        System.err.println("Invalid quantity for order detail ID: " + detail.getOrderDetailId());
                        quantity = 1; // default
                    }
                    orderTotal += quantity * detail.getUnitPrice();
                }

                // Get payments made for this order
                List<PaymentDTO> payments = paymentDAO.findPaymentByOrderId(order.getOrderId());
                double totalPaid = 0.0;
                if (payments != null && !payments.isEmpty()) {
                    totalPaid = payments.stream()
                            .mapToDouble(PaymentDTO::getAmount)
                            .sum();
                }

                // Remaining debt = total order value - amount paid
                totalDebt += (orderTotal - totalPaid);
            }

            return totalDebt;
        } catch (Exception e) {
            e.printStackTrace();
            return 0.0;
        }
    }
}