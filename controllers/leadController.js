const Lead = require("../models/Lead");

// Khởi tạo hệ thống lead (chỉ gọi 1 lần đầu)
exports.initLead = async (req, res) => {
    const exists = await Lead.findOne();
    if (exists) return res.status(400).json({ message: "Lead system already initialized" });

    const lead = new Lead({
        totalTarget: 0,
        achievedLeads: 0,
        inputHistory: [],
        historyStack: [],
        redoStack: [],
    });

    await lead.save();
    res.status(201).json({ message: "Lead tracking initialized", data: lead });
};

// Lấy thông tin lead chung
exports.getLead = async (req, res) => {
    const lead = await Lead.findOne();
    if (!lead) return res.status(404).json({ error: "Lead data not found" });
    res.json(lead);
};

// Cập nhật mục tiêu
exports.updateTarget = async (req, res) => {
    const { newTarget } = req.body;
    const lead = await Lead.findOne();
    if (!lead) return res.status(404).json({ error: "Lead data not found" });

    lead.totalTarget = newTarget;
    await lead.save();
    res.json(lead);
};

// Thêm số lượng lead tuần mới
// exports.addLeads = async (req, res) => {
//     const { value } = req.body;
//     const parsed = parseInt(value);
//     if (isNaN(parsed)) return res.status(400).json({ error: "Invalid value" });

//     const lead = await Lead.findOne();
//     if (!lead) return res.status(404).json({ error: "Lead not found" });

//     // Lưu trạng thái cũ vào history stack
//     lead.historyStack.push({
//         achievedLeads: lead.achievedLeads,
//         inputHistory: [...lead.inputHistory],
//     });

//     // Clear redo stack
//     lead.redoStack = [];

//     const newTotal = lead.achievedLeads + parsed;
//     const timestamp = new Date().toLocaleString("vi-VN");

//     lead.achievedLeads = newTotal;
//     lead.inputHistory.unshift({ value: parsed, timestamp, total: newTotal });

//     await lead.save();
//     res.json(lead);
// };
exports.addLeads = async (req, res) => {
    const { value } = req.body;
    const parsed = parseInt(value);
    if (isNaN(parsed)) return res.status(400).json({ error: "Invalid value" });

    const lead = await Lead.findOne();
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    if (lead.totalTarget === 0) {
        return res.status(400).json({ error: "Bạn cần đặt mục tiêu trước khi cập nhật lead!" });
    }

    // Lưu lịch sử
    lead.historyStack.push({
        achievedLeads: lead.achievedLeads,
        inputHistory: [...lead.inputHistory],
    });

    lead.redoStack = [];

    const newTotal = lead.achievedLeads + parsed;
    const timestamp = new Date().toLocaleString("vi-VN");

    lead.achievedLeads = newTotal;
    lead.inputHistory.unshift({ value: parsed, timestamp, total: newTotal });

    await lead.save();
    res.json(lead);
};

// Undo
exports.undoLead = async (req, res) => {
    const lead = await Lead.findOne();
    if (!lead || lead.historyStack.length === 0)
        return res.status(400).json({ error: "No undo available" });

    lead.redoStack.push({
        achievedLeads: lead.achievedLeads,
        inputHistory: [...lead.inputHistory],
    });

    const prev = lead.historyStack.pop();
    lead.achievedLeads = prev.achievedLeads;
    lead.inputHistory = prev.inputHistory;

    await lead.save();
    res.json(lead);
};

// Redo
exports.redoLead = async (req, res) => {
    const lead = await Lead.findOne();
    if (!lead || lead.redoStack.length === 0)
        return res.status(400).json({ error: "No redo available" });

    lead.historyStack.push({
        achievedLeads: lead.achievedLeads,
        inputHistory: [...lead.inputHistory],
    });

    const redo = lead.redoStack.pop();
    lead.achievedLeads = redo.achievedLeads;
    lead.inputHistory = redo.inputHistory;

    await lead.save();
    res.json(lead);
};

// Reset toàn bộ hệ thống
exports.resetLead = async (req, res) => {
    const lead = await Lead.findOne();
    if (!lead) return res.status(404).json({ error: "No lead data found" });

    lead.totalTarget = 0;
    lead.achievedLeads = 0;
    lead.inputHistory = [];
    lead.historyStack = [];
    lead.redoStack = [];

    await lead.save();
    res.json({ message: "Lead system reset" });
};
