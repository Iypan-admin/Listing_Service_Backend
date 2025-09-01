const { supabaseAdmin } = require("../config/supabaseClient");
const csv = require("csv-parser");
const fs = require("fs");

async function getNextReferenceId() {
    const { data, error } = await supabaseAdmin
        .from("giveaway")
        .select("reference_id")
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) throw error;

    let lastNumber = 3859; // so first becomes ISMLINO3860
    if (data && data.length > 0 && data[0].reference_id) {
        const match = data[0].reference_id.match(/ISMLINO(\d+)/);
        if (match) {
            lastNumber = parseInt(match[1]);
        }
    }

    return lastNumber + 1;
}

// ✅ Upload CSV and insert into Supabase (table: giveaway)
exports.uploadGiveawayCSV = async (req, res) => {
    try {
        if (!req.file) {
            console.error("❌ CSV file is missing");
            return res.status(400).json({ error: "CSV file is missing" });
        }

        const results = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (row) => results.push(row))
            .on("end", async () => {
                try {
                    let nextId = await getNextReferenceId();

                    // 🔑 Match CSV columns with `giveaway` table
                    const insertData = results.map((row) => {
                        const refId = `ISMLINO${nextId++}`;
                        return {
                            reference_id: refId,
                            name_on_the_pass: row.name_on_the_pass, // required
                            card_name: row.card_name || null,
                            city: row.city || null,
                            customer_email: row.customer_email || null,
                            customer_phone: row.customer_phone || null,
                            status: row.status || "success", // ✅ default success
                            created_at: new Date().toISOString(),
                        };
                    });

                    const { data, error } = await supabaseAdmin
                        .from("giveaway")
                        .insert(insertData);

                    // delete csv after upload
                    fs.unlinkSync(req.file.path);

                    if (error) {
                        console.error("❌ Supabase insert error:", error);
                        return res.status(500).json({ error: "Database insert failed" });
                    }

                    console.log("✅ CSV uploaded and saved:", data?.length, "rows");
                    return res.status(200).json({ status: "ok", inserted: data?.length });
                } catch (err) {
                    console.error("❌ CSV processing error:", err);
                    return res.status(500).json({ error: "CSV processing failed" });
                }
            });
    } catch (err) {
        console.error("❌ Upload error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

// ✅ Insert single manual giveaway entry
exports.addGiveawayManual = async (req, res) => {
    try {
        const {
            name_on_the_pass,
            card_name,
            city,
            customer_email,
            customer_phone,
            status
        } = req.body;

        // Basic validation
        if (!name_on_the_pass) {
            return res.status(400).json({ error: "name_on_the_pass is required" });
        }

        // 🔑 Auto-generate reference_id
        const nextId = await getNextReferenceId();
        const refId = `ISMLINO${nextId}`;

        const { data, error } = await supabaseAdmin
            .from("giveaway")
            .insert([{
                reference_id: refId,
                name_on_the_pass,
                card_name: card_name || null,
                city: city || null,
                customer_email: customer_email || null,
                customer_phone: customer_phone || null,
                status: status || "success",
                created_at: new Date().toISOString(),
            }]);

        if (error) {
            console.error("❌ Insert error:", error);
            return res.status(500).json({ error: "Insert failed" });
        }

        return res.status(201).json({ message: "Giveaway entry added", data });
    } catch (err) {
        console.error("❌ Server error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};
// ✅ Fetch all giveaways
exports.getAllGiveaways = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("giveaway")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("❌ Fetch error:", error);
            return res.status(500).json({ error: "Fetch failed" });
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error("❌ Server error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

// ✅ Get Card Stats (Pending, Active, Total)
exports.getCardStats = async (req, res) => {
    try {
        // 1. Get all generated cards
        const { data: cards, error } = await supabaseAdmin
            .from("elite_card_generate")
            .select("id, status");

        if (error) {
            console.error("❌ Card Fetch error:", error);
            return res.status(500).json({ error: "Card fetch failed" });
        }

        // 2. Calculate counts
        const pending = cards.filter((c) => c.status === "card_generated").length;
        const active = cards.filter((c) => c.status === "approved").length;
        const total = pending + active;

        return res.status(200).json({ total, pending, active });
    } catch (err) {
        console.error("❌ Stats error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

// ✅ Get recent 2 Pending Cards from elite_card_generate
exports.getRecentPendingCards = async (req, res) => {
    try {
        // Fetch recent 2 pending cards
        const { data: cards, error } = await supabaseAdmin
            .from("elite_card_generate")
            .select("id, name_on_the_pass, email, card_number,card_name, status, created_at")
            .eq("status", "card_generated")   // only pending
            .order("created_at", { ascending: false })
            .limit(2);

        if (error) {
            console.error("❌ Fetch error:", error);
            return res.status(500).json({ error: "Card fetch failed" });
        }

        return res.status(200).json(cards);
    } catch (err) {
        console.error("❌ Server error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

