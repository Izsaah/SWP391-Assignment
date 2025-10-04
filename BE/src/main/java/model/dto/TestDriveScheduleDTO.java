package model.dto;

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author Admin
 */
public class TestDriveScheduleDTO {
    private int appointmentId;
    private int customerId;
    private int modelId;
    private String scheduledId;
    private String date;
    private String status;

    public TestDriveScheduleDTO() {
    }

    public TestDriveScheduleDTO(int appointmentId, int customerId, int modelId, String scheduledId, String date, String status) {
        this.appointmentId = appointmentId;
        this.customerId = customerId;
        this.modelId = modelId;
        this.scheduledId = scheduledId;
        this.date = date;
        this.status = status;
    }

    public int getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(int appointmentId) {
        this.appointmentId = appointmentId;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public int getModelId() {
        return modelId;
    }

    public void setModelId(int modelId) {
        this.modelId = modelId;
    }

    public String getScheduledId() {
        return scheduledId;
    }

    public void setScheduledId(String scheduledId) {
        this.scheduledId = scheduledId;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
