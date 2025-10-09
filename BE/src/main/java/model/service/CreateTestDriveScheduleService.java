/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model.service;

import java.util.ArrayList;
import java.util.List;
import model.dao.CustomerDAO;
import model.dao.TestDriveScheduleDAO;
import model.dto.CustomerDTO;
import model.dto.TestDriveScheduleDTO;

/**
 *
 * @author ACER
 */
public class CreateTestDriveScheduleService {

    private final TestDriveScheduleDAO TDDAO = new TestDriveScheduleDAO();
    private final CustomerDAO CDAO = new CustomerDAO();
    private final CreateCustomerService CCS = new CreateCustomerService();

    public TestDriveScheduleDTO createTestDriveSchedule( int customer_id, String serial_id, String schedule_id, String date, String status) {
        if (status == null || !status.equalsIgnoreCase("APPROVED")) {
            status = "PENDING";
        }
        return TDDAO.create( customer_id, serial_id, schedule_id, date, status);
    }

    public List<CustomerDTO> getTestDriveScheduleByCustomer(String name) {

        List<CustomerDTO> customerWithSchedule = CDAO.findByName(name);

        if (customerWithSchedule == null || customerWithSchedule.isEmpty()) {
            return new ArrayList<>();
        }
        for (CustomerDTO tmp : customerWithSchedule) {

            int customerId = tmp.getCustomerId();

            TestDriveScheduleDTO schedules = TDDAO.getTestDriveScheduleByCustomerId(customerId);

            if (schedules != null) {
                tmp.setTestDriveSchedule(schedules);
            }
        }

        return customerWithSchedule;
    }
    
    public TestDriveScheduleDTO UpdateTestDriveSchedule(int appointmentId, String newStatus) {
        
       
        
        if (newStatus != null && !newStatus.trim().isEmpty()) {
            
           
            return TDDAO.updateStatus(appointmentId, newStatus);
        }
        

        return null;
    }
    
}
