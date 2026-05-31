const express = require("express");
const { authenticateUser, createAuditLog } = require("../services/dataStore");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    await createAuditLog({
      action: "User Login",
      admin_name: user.name,
      details: `${user.role} signed in`,
      request_id: null,
    });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("AUTH ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Authentication service failed",
    });
  }
});

module.exports = router;
