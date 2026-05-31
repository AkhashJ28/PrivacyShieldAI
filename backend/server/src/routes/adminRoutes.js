const express = require("express");

const supabase = require("../config/supabase");

const router = express.Router();

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

    const { data, error } = await supabase
      .from("access_requests")
      .update({
        status: status
      })
      .eq("id", requestId)
      .select();

    if (error) {

      console.log("DATABASE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update request"
      });

    }

    const { error: logError } = await supabase
        .from("audit_logs")
        .insert([
            {
            request_id: requestId,
            action: status,
            admin_name: "Admin1"
            }
        ]);

    if (logError) {
    console.log("AUDIT LOG ERROR:", logError);
    }

    res.json({
      success: true,
      updatedRequest: data[0]
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