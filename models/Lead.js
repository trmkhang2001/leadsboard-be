const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
    totalTarget: { type: Number, required: true },
    achievedLeads: { type: Number, required: true },
    inputHistory: [
        {
            value: Number,
            timestamp: String,
            total: Number,
        },
    ],
    historyStack: [
        {
            achievedLeads: Number,
            inputHistory: [],
        },
    ],
    redoStack: [
        {
            achievedLeads: Number,
            inputHistory: [],
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Lead", leadSchema);
