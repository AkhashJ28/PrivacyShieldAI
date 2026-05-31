const express = require("express");

const supabase = require("../config/supabase");

const router = express.Router();

router.get("/", async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("DATABASE FETCH ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch documents"
      });
    }

    res.json({
      success: true,
      documents: data
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