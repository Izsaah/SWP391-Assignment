package model.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import model.service.CreateFeedBackService; // Assuming this service has the delete method
import utils.ResponseUtils;

/**
 *
 * @author Admin
 */
@WebServlet("/api/staff/deleteFeedBackByFeedBackId")
public class DeleteFeedBackByFeedBackIdController extends HttpServlet {

    // Rename to a more appropriate service name if possible (e.g., FeedbackService)
    private final CreateFeedBackService CFBService = new CreateFeedBackService();

    // Use doPost for deletion operations
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        String idParam = req.getParameter("id");

        if (idParam == null || idParam.trim().isEmpty()) {
            ResponseUtils.error(resp, "Feedback ID is required");
            return;
        }

        int feedbackId;
        try {

            feedbackId = Integer.parseInt(idParam);
        } catch (NumberFormatException e) {
            ResponseUtils.error(resp, "Invalid Feedback ID format");
            return;
        }

        boolean isDeleted = CFBService.deleteFeedBack(feedbackId);

        if (isDeleted) {
            ResponseUtils.success(resp, "Feedback with ID " + feedbackId + " successfully deleted", null);
        } else {

            ResponseUtils.error(resp, "Failed to delete feedback with ID " + feedbackId + ". It may not exist.");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // You can simply call doPost or implement the logic here directly
        doPost(req, resp);
    }
}
