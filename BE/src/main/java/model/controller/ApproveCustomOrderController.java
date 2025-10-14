package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import model.service.CreateOrderService;
import utils.RequestUtils;
import utils.ResponseUtils;

@WebServlet("/api/staff/approveCustomOrder")
public class ApproveCustomOrderController extends HttpServlet {

    private final CreateOrderService service = new CreateOrderService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Map<String, Object> params = RequestUtils.extractParams(req);

            int orderId = Integer.parseInt(params.get("orderId").toString());
            boolean isAgree = Boolean.parseBoolean(params.get("isAgree").toString());
            double unitPrice = Double.parseDouble(params.get("unitPrice").toString());

            boolean result = service.approveCustomOrder(orderId, isAgree, unitPrice);

            if (result) {
                ResponseUtils.success(resp, "Custom order processed successfully",
                        isAgree ? "Approved" : "Disagreed");
            } else {
                ResponseUtils.error(resp, "Failed to process custom order");
            }

        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid number format in parameters");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseUtils.error(resp, "Error processing custom order: " + e.getMessage());
        }
    }
}
