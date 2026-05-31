const express = require("express");
const {
  createAuditLog,
  listAuditLogs,
  listUsers,
  updateRequestStatus,
} = require("../services/dataStore");

const router = express.Router();

router.get("/audit-logs", async (req, res) => {
  try {
    const logs = await listAuditLogs();

    res.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.log("AUDIT LOG FETCH ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
    });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await listUsers();

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.log("USER FETCH ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

router.patch("/:id", async (req, res) => {

  try {

    const requestId = req.params.id;

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const updatedRequest = await updateRequestStatus(requestId, status);

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    await createAuditLog({
      request_id: requestId,
      action: `Access ${status}`,
      admin_name: req.body.admin_name || "Admin",
      details: `Request ${requestId} was ${status}`
    });

    res.json({
      success: true,
      updatedRequest
    });

  } catch (error) {

    console.log("SERVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

});

module.exports = router;
