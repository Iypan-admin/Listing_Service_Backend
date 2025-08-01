const supabase = require('../config/supabaseClient');
const nodemailer = require("nodemailer");
const path = require("path");
const { text } = require('stream/consumers');

const registerInfluencer = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        console.log("Received data:", { name, email, phone });

        if (!name || !email || !phone) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // 🔍 Step 1: Check if email already exists
        const { data: existingInfluencer, error: checkError } = await supabase
            .from("influencers")
            .select("email")
            .eq("email", email)
            .single(); // returns one record if exists

        if (checkError && checkError.code !== "PGRST116") {
            console.error("Supabase email check error:", checkError);
            throw checkError;
        }

        if (existingInfluencer) {
            return res.status(400).json({ error: "This email is already registered." });
        }

        // Step 2: Get current count
        const { count, error: countError } = await supabase
            .from("influencers")
            .select("*", { count: "exact", head: true });

        if (countError) {
            console.error("Supabase count error:", countError);
            throw countError;
        }

        const influencer_id = `ismlinflu${100 + count + 1}`;
        console.log("Generated Influencer ID:", influencer_id);

        // Step 3: Insert into DB
        const { data, error: insertError } = await supabase.from("influencers").insert([
            {
                name,
                email,
                phone,
                influencer_id,
            },
        ]);

        if (insertError) {
            console.error("Insert error:", insertError);
            throw insertError;
        }

        // Step 4: Send Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const pdfPath1 = path.join(__dirname, "../pdf/ELITE CARD DETAILS.pdf");
        const pdfPath2 = path.join(__dirname, "../pdf/ISML ELITE CARD  GUIDELINES.pdf");

        const mailOptions = {
            from: `"ELITE CARD - Indian School for Modern Languages" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Welcome to the ISML Elite Membership Campaign! 🎓✨ Let’s Empower India to Learn!",
            html: `
  <div style="font-family: Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.6;">
    <p>Hi ${name},</p>

    <p>We’re excited to collaborate with you on our <b>Elite Membership Campaign</b> for <b>ISML – the Indian School for Modern Languages</b> – a bold initiative making premium <b>French, German, and Japanese</b> language education accessible to everyone in India, starting at just <b>₹49</b>.</p>

    <h3 style="margin-top: 24px;">Who are we?</h3>
    <p>ISML is not just an Ed-Tech platform — it’s a mission-driven movement to <b>simplify foreign language learning</b> through <b>affordable</b>, lifetime-access learning programs. We focus on practical usage, not grammar drills, helping learners connect with <b>global opportunities</b>.</p>

    <h3 style="margin-top: 24px;">What is this Campaign About?</h3>
    <p>You’ve been selected to join our <b>ISML Elite Creator Circle</b>. Your role is to spread awareness about the ISML Elite Cards, priced at <b>₹49, ₹99, and ₹199</b>. Each card unlocks lifetime access to all <b>3 language learning programs</b> — <b>and more to come</b>.</p>

    <h3 style="margin-top: 24px;">Your Role: What You Need to Do</h3>
    <ul>
      <li>Use our <b>Custom Creator Kit</b> (we’ll send you ready-to-use reels, post captions, and story templates and ideas).</li>
      <li>Share the campaign across your <b>Instagram, Facebook, YouTube, and WhatsApp</b>.</li>
      <li><b>Posting Plan</b> (within 7 days): 2 Reels, 1 Feed Post, 3 to 5 Story Sets</li>
    </ul>

    <h3 style="margin-top: 24px;">Sales Expectation:</h3>
    <p>We expect a minimum of <b>10 Elite Card sales</b> (Not Compulsory) from your audience in the next 7 days. Creators showing exceptional creativity or conversions will be featured on our official pages and considered for <b>long-term paid collaborations</b> and city-level franchise roles.</p>

    <h3 style="margin-top: 24px;">Your Benefits:</h3>
    <ul>
      <li><b>Free ISML <u>InfinityPass</u> worth ₹199</b> (can be used for <b>yourself</b> or <b>gifted</b>).</li>
      <li><b>Featured spotlight</b> on our official ISML social media pages.</li>
      <li><b>Eligibility</b> to become an ISML Brand Ambassador with higher commissions and campaign priority.</li>
    </ul>

    <h3 style="margin-top: 24px;">Additional Value for you:</h3>
    <p>Every Elite Member of <b><u>InfinityPass</u></b> gets:</p>
    <ul>
      <li>Access to <b>6 languages in 3 years</b></li>
      <li><b>Savings of over ₹59,700</b> on regular fees</li>
      <li><b>3-months internship certificate</b></li>
      <li>Library, LMS and toolkit access</li>
      <li>50% off on live events, workshops and more</li>
    </ul>

    <p>Once we receive your confirmation, we will send your <b>Creator Toolkit and your Virtual Elite Card</b> in E-mail within 30 minutes.</p>

    <p>To confirm, simply reply <b>“YES”</b> after reading the Terms and Conditions and Welcome Kit.</p>

    <h3 style="margin-top: 24px;">How to Get Started:</h3>
    <p>Reply with the following details to <b>confirm participation</b> and activate your <b>Elite Creator profile</b>:</p>
    <ol>
      <li><b>Full Name</b></li>
      <li><b>Email ID</b></li>
      <li><b>Contact Number</b> (<u>WhatsApp</u> enabled)</li>
      <li><b>Name to display on Elite Card</b> (Learner Name)</li>
    </ol>

    <p>Let’s work together to inspire more learners across India.<br>
    <a href="https://www.indianschoolformodernlanguages.com" target="_blank" style="color: #1a73e8;">Looking forward to a high-impact campaign with you.</a></p>

    <p style="margin-top: 32px;">
      Warm regards,<br>
      <b>Team ISML – Elite Membership</b><br>
      <a href="https://www.indianschoolformodernlanguages.com" target="_blank">www.indianschoolformodernlanguages.com</a><br>
      For any support feel free to Contact us at <b>9385457322</b> (10:00 AM – 06:00 PM)
    </p>

    <p style="font-size: 12px; color: #888;">
      All content, data, and brand assets of <b>Iypan</b> Educational Centre Pvt Ltd are protected by copyright and trademark laws — unauthorized use is strictly prohibited.
    </p>
  </div>
  `,
            attachments: [
                { filename: "Influencer_Welcome Letter.pdf", path: pdfPath1 },
                { filename: "Influencer_Terms & Conditions.pdf", path: pdfPath2 },
            ],
        };

        await transporter.sendMail(mailOptions);
        console.log("Mail sent successfully");

        return res.status(201).json({ message: "Mail sent", influencer_id, data });
    } catch (err) {
        console.error("Error in controller:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getInfluencerCount = async (req, res) => {
    try {
        const { count, error } = await supabase
            .from("influencers")
            .select("*", { count: "exact", head: true });

        if (error) throw error;

        return res.status(200).json({ count });
    } catch (err) {
        console.error("Count error:", err);
        return res.status(500).json({ error: "Could not fetch count" });
    }
};

// ✅ Get all influencers
const getAllInfluencers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("influencers")
            .select("*")
            .order("created_at", { ascending: false }); // no limit

        if (error) throw error;

        return res.status(200).json(data);
    } catch (err) {
        console.error("Error fetching influencers:", err);
        return res.status(500).json({ error: "Failed to fetch all influencers" });
    }
};



module.exports = {
    registerInfluencer,
    getInfluencerCount,
    getAllInfluencers,
};
