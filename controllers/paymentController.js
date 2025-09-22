// controllers/paymentController.js
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { supabaseAdmin } = require("../config/supabaseClient");

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

// ✅ Razorpay instance
const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_SECRET,
});

exports.razorpayWebhook = async (req, res) => {
    try {
        // 1) Verify webhook signature (express.raw middleware required)
        const rawBody = req.body; // Buffer
        const shasum = crypto.createHmac("sha256", WEBHOOK_SECRET);
        shasum.update(rawBody);
        const digest = shasum.digest("hex");

        if (digest !== req.headers["x-razorpay-signature"]) {
            console.error("❌ Invalid Razorpay signature");
            return res.status(400).json({ error: "Invalid signature" });
        }

        // 2) Parse JSON
        const parsedBody = JSON.parse(rawBody.toString("utf8"));
        const event = parsedBody.event;
        console.log("📩 Webhook Event:", event);

        const entity = parsedBody?.payload?.payment?.entity;
        if (!entity) {
            console.error("❌ No payment entity in payload");
            return res.status(400).json({ error: "No payment entity" });
        }

        if (event !== "payment.captured") {
            // Only process captured
            return res.status(200).json({ status: "ignored" });
        }

        // 3) Prepare fields to store
        const {
            id: payment_id,
            order_id,
            method,
            vpa,
            contact,
            email,
            amount,
            notes,
            acquirer_data,
        } = entity;

        // Convert to rupees
        const rupeeAmount = (amount ?? 0) / 100;

        // ✅ Decide card_name based on amount
        let card_name = null;
        if (rupeeAmount === 49) {
            card_name = "EduPass";
        } else if (rupeeAmount === 299) {
            card_name = "ScholarPass";
        } else if (rupeeAmount === 499) {
            card_name = "InfinitePass";
        } else {
            // ❌ Ignore other pages
            console.log("❌ Ignored - Not from our 3 plan pages:", rupeeAmount);
            return res.status(200).json({ status: "ignored" });
        }


        // 4) Insert into Supabase (new table: elite_card_payment)
        const { data, error } = await supabaseAdmin
            .from("elite_card_payment")
            .insert([
                {
                    payment_id,
                    order_id: order_id || null,
                    bank_rrn: acquirer_data?.rrn || null,
                    payment_method: method || null,
                    upi_id: vpa || null,
                    customer_phone: contact || null,
                    customer_email: email || null,
                    amount: rupeeAmount, // rupees
                    city: notes?.city || null,
                    full_name: notes?.full_name || null,
                    name_on_the_pass: notes?.name_on_the_pass || null,
                    pin_code: notes?.pin_code || null,
                    status: "success",
                    card_name, // 👈 new field
                },
            ]);

        if (error) {
            console.error("❌ Supabase insert error:", error);
            return res.status(500).json({ error: "Database insert failed" });
        }

        console.log("✅ Payment saved to DB (elite_card_payment):", data);
        return res.status(200).json({ status: "ok" });
    } catch (err) {
        console.error("❌ Webhook error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};
