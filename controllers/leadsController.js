// controllers/leadsController.js
const { supabase } = require("../config/supabaseClient");

// 🔹 Utility - validate course & source enums
const validCourses = ["French", "German", "Japanese"];
const validSources = [
    "Facebook",
    "Website",
    "Google",
    "Justdial",
    "Associate Reference",
    "Student Reference",
    "Walk-in",
    "ISML Leads",
];

const validStatuses = [
    "data_entry",
    "not_connected_1",
    "not_connected_2",
    "not_connected_3",
    "interested",
    "need_follow",
    "junk_lead",
    "demo_schedule",
    "lost_lead",
    "enrolled",
    "closed_lead",
];

// ✅ Create new lead
exports.createLead = async (req, res) => {
    try {
        const { id: user_id } = req.user; // JWT payload → user id
        const { name, phone, email, course, remark, source } = req.body;

        // Validation
        if (!name || !phone || !course || !source) {
            return res.status(400).json({
                success: false,
                message: "Name, phone, course and source are required",
            });
        }
        if (!validCourses.includes(course)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course value",
            });
        }
        if (!validSources.includes(source)) {
            return res.status(400).json({
                success: false,
                message: "Invalid source value",
            });
        }

        const { data, error } = await supabase
            .from("leads")
            .insert([
                {
                    user_id,
                    name,
                    phone,
                    email,
                    course,
                    remark,
                    source,
                    status: "data_entry",
                },
            ])
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: "Lead created successfully",
            lead: data,
        });
    } catch (err) {
        console.error("❌ Error creating lead:", err.message);
        res.status(500).json({
            success: false,
            message: err.message || "Server error",
        });
    }
};

// ✅ Get all leads for logged-in user
exports.getLeads = async (req, res) => {
    try {
        const { id: user_id } = req.user;

        const { data, error } = await supabase
            .from("leads")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        res.json({ success: true, leads: data });
    } catch (err) {
        console.error("❌ Error fetching leads:", err.message);
        res.status(500).json({
            success: false,
            message: err.message || "Server error",
        });
    }
};

// ✅ Update lead status
exports.updateLeadStatus = async (req, res) => {
    try {
        const { id: user_id } = req.user;
        const { id } = req.params; // lead_id
        const { status } = req.body;

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }

        const { data, error } = await supabase
            .from("leads")
            .update({ status })
            .eq("lead_id", id)
            .eq("user_id", user_id) // only owner can update
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Lead not found or not owned by user",
            });
        }

        res.json({
            success: true,
            message: "Lead status updated successfully",
            lead: data,
        });
    } catch (err) {
        console.error("❌ Error updating lead:", err.message);
        res.status(500).json({
            success: false,
            message: err.message || "Server error",
        });
    }
};
