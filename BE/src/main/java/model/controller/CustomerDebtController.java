package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import model.service.CustomerDebtService;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/customer/debt")
public class CustomerDebtController extends HttpServlet {

    private final CustomerDebtService service = new CustomerDebtService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        try {
            Map<String, Object> params = RequestUtils.extractParams(req);
            String customerIdParam = (String) params.get("customerId");

            if (ResponseUtils.isNullOrEmpty(customerIdParam)) {
                ResponseUtils.error(resp, "Missing required field: customerId");
                return;
            }

            int customerId = Integer.parseInt(customerIdParam);
            double totalDebt = service.getDebtByCustomerId(customerId);

            ResponseUtils.success(resp, "Successfully retrieved customer debt.", totalDebt);

        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid 'customerId': must be a number.");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Error fetching customer debt: " + e.getMessage());
        }
    }
}
