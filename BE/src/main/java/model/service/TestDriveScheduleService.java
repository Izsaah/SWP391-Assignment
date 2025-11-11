package model.service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import model.dao.CustomerDAO;
import model.dao.TestDriveScheduleDAO;
import model.dto.CustomerDTO;
import model.dto.TestDriveScheduleDTO;

public class TestDriveScheduleService {

    private final TestDriveScheduleDAO TDDAO = new TestDriveScheduleDAO();
    private final CustomerDAO CDAO = new CustomerDAO();

    /**
     * Create a new test drive schedule for a customer.
     */
    public TestDriveScheduleDTO createTestDriveSchedule(int customerId, String serialId, String date) {
        if (customerId <= 0 || serialId == null || serialId.trim().isEmpty() || date == null || date.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid input parameters for creating test drive schedule.");
        }
        return TDDAO.create(customerId, serialId, date, "PENDING");
    }

    /**
     * Get test drive schedules by customer name.
     */
    public List<CustomerDTO> getTestDriveScheduleByCustomer(String name) {
        if (name == null || name.trim().isEmpty()) return new ArrayList<>();

        List<CustomerDTO> customers = CDAO.findByName(name);
        if (customers == null || customers.isEmpty()) return new ArrayList<>();

        for (CustomerDTO customer : customers) {
            TestDriveScheduleDTO schedule = TDDAO.getTestDriveScheduleByCustomerId(customer.getCustomerId());
            if (schedule != null) {
                customer.setTestDriveSchedule(schedule);
            }
        }
        return customers;
    }

    /**
     * Update the status of a test drive schedule.
     */
    public TestDriveScheduleDTO updateTestDriveSchedule(int appointmentId, String newStatus) {
        if (appointmentId <= 0 || newStatus == null || newStatus.trim().isEmpty()) return null;
        return TDDAO.updateStatus(appointmentId, newStatus);
    }

    /**
     * Get a test drive schedule by customer and dealer.
     */
    public TestDriveScheduleDTO getTestDriveScheduleByCustomerAndDealer(int customerId, int dealerId) throws ClassNotFoundException {
        if (customerId <= 0 || dealerId <= 0) {
            throw new IllegalArgumentException("Customer ID and Dealer ID must be positive numbers");
        }

        TestDriveScheduleDTO schedule = TDDAO.getTestDriveScheduleByCustomerIdAndDealer(customerId, dealerId);
        if (schedule == null) {
            System.out.println("No test drive found for customer " + customerId + " at dealer " + dealerId);
        }
        return schedule;
    }

    /**
     * Get all test drive schedules for a dealer.
     * Includes all customers who have schedules at this dealer.
     */
    public List<CustomerDTO> getAllTestDriveSchedulesByDealer(int dealerId) throws SQLException, ClassNotFoundException {
        if (dealerId <= 0) throw new IllegalArgumentException("Dealer ID must be a positive number.");

        // Get all test drive schedules for this dealer
        List<TestDriveScheduleDTO> schedules = TDDAO.getTestDriveSchedulesByDealer(dealerId);
        if (schedules == null || schedules.isEmpty()) return new ArrayList<>();

        List<CustomerDTO> customers = new ArrayList<>();
        for (TestDriveScheduleDTO schedule : schedules) {
            CustomerDTO customer = CDAO.getCustomerById(schedule.getCustomerId());
            if (customer != null) {
                customer.setTestDriveSchedule(schedule);
                customers.add(customer);
            }
        }
        return customers;
    }
}
