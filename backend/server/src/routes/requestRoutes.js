const express = require("express");

const supabase = require("../config/supabase");

const router = express.Router();

router.get("/", async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("access_requests")
      .select(`
        *,
        documents (
          original_name,
          file_url
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {

      console.log("DATABASE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch requests"
      });

    }

    res.json({
      success: true,
      requests: data
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

    const { data, error } = await supabase
      .from("access_requests")
      .insert([
        {
          document_id,
          officer_name,
          reason
        }
      ])
      .select();

    if (error) {

      console.log("DATABASE ERROR:", error.message);
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create request"
      });

    }

    res.json({
      success: true,
      request: data[0]
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