const express = require("express");
const { createAuditLog, createRequest, listRequests } = require("../services/dataStore");

const router = express.Router();

router.get("/", async (req, res) => {

  try {
    const requests = await listRequests();

    res.json({
      success: true,
      requests
    });

  } catch (error) {

    console.log("SERVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

});

router.post("/", async (req, res) => {

  try {

    const {
      document_id,
      officer_name,
      reason
    } = req.body;

    if (!document_id || !officer_name || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const request = await createRequest({ document_id, officer_name, reason });

    await createAuditLog({
      action: "Access Requested",
      admin_name: officer_name,
      details: reason,
      request_id: request.id
    });

    res.json({
      success: true,
      request
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
