package model.service;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import model.dao.ConfirmationDAO;
import model.dao.OrderDAO;
import model.dao.OrderDetailDAO;
import model.dao.VehicleSerialDAO;
import model.dao.VehicleVariantDAO;
import model.dto.ConfirmationDTO;
import model.dto.OrderDTO;
import model.dto.OrderDetailDTO;
import model.dto.VehicleSerialDTO;
import model.dto.VehicleVariantDTO;
import utils.DbUtils;

public class OrderService {

    private final ConfirmationDAO confirmationDAO = new ConfirmationDAO();
    private final OrderDAO orderDAO = new OrderDAO();
    private final VehicleVariantDAO variantDAO = new VehicleVariantDAO();
    private final VehicleSerialDAO vehicleSerialDAO = new VehicleSerialDAO();
    private final OrderDetailDAO orderDetailDAO = new OrderDetailDAO();

    public List<OrderDTO> GetListOrderByDealerStaffId(int dealerStaffId) {
        try {
            List<OrderDTO> orderList = orderDAO.getByStaffId(dealerStaffId);

            if (orderList == null || orderList.isEmpty()) {
                return Collections.emptyList();
            }

            for (OrderDTO order : orderList) {
                OrderDetailDTO detail = orderDetailDAO.getOrderDetailByOrderId(order.getOrderId());
                order.setDetail(detail);
            }

            return orderList;
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public List<OrderDTO> HandlingGetOrdersByCustomerId(int customerId) {
        try {
            List<OrderDTO> orderList = orderDAO.getByCustomerId(customerId);

            if (orderList == null || orderList.isEmpty()) {
                return Collections.emptyList();
            }

            for (OrderDTO order : orderList) {

                OrderDetailDTO detail = orderDetailDAO.getOrderDetailByOrderId(order.getOrderId());
                order.setDetail(detail);

                if (detail != null) {

                    ConfirmationDTO confirmation = confirmationDAO.getConfirmationByOrderDetailId(detail.getOrderDetailId());

                    if (confirmation != null) {
                        order.setConfirmation(confirmation);
                        order.setIsCustom(true);
                    } else {
                        order.setIsCustom(false);
                    }
                }
            }

            return orderList;
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}
