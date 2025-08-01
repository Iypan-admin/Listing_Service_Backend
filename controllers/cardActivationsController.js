const supabase = require("../config/supabaseClient");
const csv = require("csv-parser");
const fs = require("fs");

// Upload CSV and insert into Supabase
const uploadCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "CSV file is missing" });
        }

        const results = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (row) => results.push(row))
            .on("end", async () => {
                const insertData = results.map((row) => ({
                    card_no: row.card_no,
                    card_name: row.card_name,
                    card_type: row.card_type,
                    payment_id: row.payment_id,
                    payment_date: row.payment_date,
                    email: row.email,
                    phone: row.phone,
                    status: false, // default inactive
                    created_at: new Date().toISOString()
                }));

                const { data, error } = await supabase
                    .from("card_activations")
                    .insert(insertData);

                // Delete uploaded CSV after processing
                fs.unlinkSync(req.file.path);

                if (error) {
                    console.error("Supabase Insert Error:", error);
                    return res.status(500).json({ message: "Insert failed", error });
                }

                res.status(200).json({ message: "Data uploaded successfully", data });
            });
    } catch (err) {
        console.error("CSV Upload Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Fetch all cards
const getAllCards = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("card_activations")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(500).json({ message: "Fetch failed", error });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ New: Get Card Statistics (total, active, inactive)
const getCardStats = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("card_activations")
            .select("status");

        if (error) {
            return res.status(500).json({ message: "Fetch failed", error });
        }

        const total = data.length;
        const active = data.filter((item) => item.status === true).length;
        const inactive = total - active;

        res.status(200).json({ total, active, inactive });
    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
const getRecentInactiveCards = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("card_activations")
            .select("*")
            .eq("status", false)
            .order("created_at", { ascending: false })
            .limit(2);

        if (error) {
            return res.status(500).json({ message: "Fetch failed", error });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    uploadCSV,
    getAllCards,
    getCardStats,
    getRecentInactiveCards,
};
