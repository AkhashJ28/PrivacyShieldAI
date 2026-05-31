const express = require("express");
const { getDocument, listDocuments } = require("../services/dataStore");

const router = express.Router();

router.get("/", async (req, res) => {

  try {
    const documents = await listDocuments();

    res.json({
      success: true,
      documents
    });

  } catch (error) {

    console.log("SERVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

});

router.get("/:id", async (req, res) => {
  try {
    const document = await getDocument(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    res.json({
      success: true,
      document
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
