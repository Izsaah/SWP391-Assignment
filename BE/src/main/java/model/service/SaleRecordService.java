package model.service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import model.dao.DealerDAO;
import model.dao.OrderDAO;
import model.dao.OrderDetailDAO;
import model.dao.SaleRecordDAO;
import model.dao.UserAccountDAO;
import model.dto.DealerDTO;
import model.dto.OrderDTO;
import model.dto.OrderDetailDTO;
import model.dto.SaleRecordDTO;
import model.dto.UserAccountDTO;

public class SaleRecordService {

    private final DealerDAO dealerDAO = new DealerDAO();
    private final OrderDAO orderDAO = new OrderDAO();
    private final OrderDetailDAO orderDetailDAO = new OrderDetailDAO();
    private final UserAccountDAO userDAO = new UserAccountDAO();
    private SaleRecordDAO saleDAO = new SaleRecordDAO();


    public List<OrderDTO> getOrdersByDealer(int dealerId) {
        try {
            List<Integer> staffIds = userDAO.getStaffIdsByDealer(dealerId);
            if (staffIds == null || staffIds.isEmpty()) {
                return new ArrayList<>();
            }
            return orderDAO.getOrdersByDealerStaffIds(staffIds);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<SaleRecordDTO> getCombinedSaleRecordsForDealerByDateRange(
            int dealerId, String startDate, String endDate) {
        try {
            List<Integer> staffIds = userDAO.getStaffIdsByDealer(dealerId);
            if (staffIds == null || staffIds.isEmpty()) {
                return Collections.emptyList();
            }

            List<SaleRecordDTO> allSales = new ArrayList<>();

            for (Integer staffId : staffIds) {
                List<SaleRecordDTO> staffSales
                        = getCombinedSaleRecordsForStaffByDateRange(staffId, startDate, endDate);
                allSales.addAll(staffSales);
            }

            return allSales;

        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public List<SaleRecordDTO> getCombinedSaleRecordsForStaffByDateRange(
            int dealerStaffId, String startDate, String endDate) {

        System.out.println("DEBUG: Processing sales for Staff ID: " + dealerStaffId);

        try {
            List<OrderDTO> allOrders = orderDAO.getByStaffId(dealerStaffId);

            if (allOrders == null || allOrders.isEmpty()) {
                System.out.println("DEBUG: Staff ID " + dealerStaffId + " has no orders in the database.");
                return Collections.emptyList();
            }
            System.out.println("DEBUG: Staff ID " + dealerStaffId + " retrieved " + allOrders.size() + " total orders.");

            Map<Integer, Double> totalSalesByCustomer = new HashMap<>();
            Map<Integer, Integer> totalOrdersByCustomer = new HashMap<>();
            Map<Integer, String> latestOrderDateByCustomer = new HashMap<>();

            int processedCount = 0;

            for (OrderDTO order : allOrders) {
                if (!isOrderInRange(order, startDate, endDate)) {
                    System.out.println("DEBUG: Skipping Order ID " + order.getOrderId() + ". Date " + order.getOrderDate() + " is outside range " + startDate + " to " + endDate);
                    continue;
                }

                processOrder(order, totalSalesByCustomer, totalOrdersByCustomer, latestOrderDateByCustomer);
                processedCount++;
            }

            System.out.println("DEBUG: Staff ID " + dealerStaffId + " finished processing. Orders processed/attempted: " + processedCount + ". Customers aggregated: " + totalSalesByCustomer.size());

            return buildSaleRecordList(totalSalesByCustomer, totalOrdersByCustomer, latestOrderDateByCustomer, dealerStaffId);

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("ERROR: Top-level error in getCombinedSaleRecordsForStaffByDateRange for Staff ID " + dealerStaffId + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }

    private boolean isOrderInRange(OrderDTO order, String startDate, String endDate) {
        String orderDate = order.getOrderDate();
        return orderDate != null
                && orderDate.compareTo(startDate) >= 0
                && orderDate.compareTo(endDate) <= 0;
    }

    private void processOrder(OrderDTO order,
            Map<Integer, Double> totalSalesByCustomer,
            Map<Integer, Integer> totalOrdersByCustomer,
            Map<Integer, String> latestOrderDateByCustomer) {

        try {
            OrderDetailDTO detail = orderDetailDAO.getOrderDetailByOrderId(order.getOrderId());
            if (detail == null) {
                return;
            }

            String quantityStr = detail.getQuantity();
            if (quantityStr == null || quantityStr.trim().isEmpty()) {
                System.err.println("Null or empty quantity for order ID: " + order.getOrderId());
                return;
            }

            int quantity = Integer.parseInt(quantityStr.trim());
            double saleAmount = quantity * detail.getUnitPrice();
            int customerId = order.getCustomerId();

            updateTotals(customerId, saleAmount, totalSalesByCustomer, totalOrdersByCustomer);
            updateLatestOrderDate(customerId, order.getOrderDate(), latestOrderDateByCustomer);

        } catch (NumberFormatException e) {
            System.err.println("Invalid quantity format in OrderDetail for order ID: " + order.getOrderId());
        } catch (Exception e) {
            System.err.println("Error processing order ID " + order.getOrderId() + ": " + e.getMessage());
        }
    }

    private void updateTotals(int customerId, double saleAmount,
            Map<Integer, Double> totalSalesByCustomer,
            Map<Integer, Integer> totalOrdersByCustomer) {

        totalSalesByCustomer.put(customerId,
                totalSalesByCustomer.getOrDefault(customerId, 0.0) + saleAmount);

        totalOrdersByCustomer.put(customerId,
                totalOrdersByCustomer.getOrDefault(customerId, 0) + 1);
    }

    private void updateLatestOrderDate(int customerId, String orderDate,
            Map<Integer, String> latestOrderDateByCustomer) {

        String currentLatest = latestOrderDateByCustomer.get(customerId);
        if (currentLatest == null || orderDate.compareTo(currentLatest) > 0) {
            latestOrderDateByCustomer.put(customerId, orderDate);
        }
    }

    private List<SaleRecordDTO> buildSaleRecordList(Map<Integer, Double> totalSalesByCustomer,
            Map<Integer, Integer> totalOrdersByCustomer,
            Map<Integer, String> latestOrderDateByCustomer,
            int dealerStaffId) {

        List<SaleRecordDTO> combinedSales = new ArrayList<>();
        for (Integer customerId : totalSalesByCustomer.keySet()) {
            double totalAmount = totalSalesByCustomer.get(customerId);
            int totalOrders = totalOrdersByCustomer.get(customerId);
            String latestOrderDate = latestOrderDateByCustomer.get(customerId);

            SaleRecordDTO dto = new SaleRecordDTO(
                    0, // summary record
                    dealerStaffId,
                    latestOrderDate,
                    totalAmount
            );

            combinedSales.add(dto);
        }

        return combinedSales;
    }
}
