package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import model.service.PaymentService;
import utils.ResponseUtils;

@WebServlet("/api/staff/viewCustomerWithActiveInstallments")
public class ViewCustomerWithActiveInstallmentsController extends HttpServlet {

}
