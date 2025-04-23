const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    initLead,
    getLead,
    addLeads,
    undoLead,
    redoLead,
    updateTarget,
    resetLead,
} = require("../controllers/leadController");

router.post("/init", auth, initLead);
router.get("/", getLead);
router.put("/target", auth, updateTarget);
router.post("/add", auth, addLeads);
router.post("/undo", auth, undoLead);
router.post("/redo", auth, redoLead);
router.post("/reset", auth, resetLead);

module.exports = router;
