
const nodemailer = require("nodemailer");
const axios = require("axios");

// ✅ Setup Transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Email Templates
const mailTemplates = {
  EduPass: (name, cardNumber) => ({
    subject: "Welcome to ISML! Your EduPass is Ready – Next Steps Inside.",
    html: `
      <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6;">
        <h2>Hi ${name},</h2>
        <p>Greetings from the <b>Indian School for Modern Languages</b> Family! We’re overjoyed to welcome you to our community of passionate learners.</p>

        <h3>🎉 You’re now an Elite Member with <b>ISML EduPass</b></h3>
        <ul>
          <li>✅ Validity: 1 Year</li>
          <li>✅ Language Access: Any 1 Language</li>
          <li>✅ Mode: Online Only</li>
          <li>✅ Your EduPass ID: <b>${cardNumber}</b></li>
          <li>✅ Flat 10% Discount on Master a Language (ML) & International Diploma (ID) programs</li>
        </ul>

        <h3>✨ Your EduPass Additional Benefits:</h3>
        <ul>
          <li>✅ Online Access</li>
          <li>✅ Flat 10% Course Discount</li>
          <li>✅ Academic Support (Past Papers)</li>
          <li>✅ ISML Community Access</li>
        </ul>

        <h3>📌 How to Join a Course:</h3>
        <ol>
          <li>Choose any one language: French / German / Japanese</li>
          <li>Select your program: ML / ID</li>
          <li>Pick a day and time slot</li>
          <li>Call Admission Manager: <b>73388 81781</b> or <a href="https://www.indianschoolformodernlanguages.com/courses">visit our website</a></li>
        </ol>

        <h3>⚖️ Terms & Conditions:</h3>
        <ul>
          <li>EduPass is non-transferable and valid for only one language.</li>
          <li>10% discount is applicable only while the card is active.</li>
          <li>EduPass does not include offline access, internships, or placement services.</li>
          <li>Discounts are only on base course fee, excluding GST/charges.</li>
          <li>Discount must be claimed before batch starts (not for ongoing batches).</li>
        </ul>

        <p>Thank you for choosing ISML. Your language journey begins today! We’re here to support you every step of the way.</p>
        <p>For help: <a href="mailto:elitemembership.isml@gmail.com">elitemembership.isml@gmail.com</a> | Call: 93854 57322</p>
        <br>
        <p>Warm regards,<br><b>Team Elite Membership</b><br>Indian School for Modern Languages</p>
      </div>
    `,
  }),

  ScholarPass: (name, cardNumber) => ({
    subject: "Welcome to ISML! Your ScholarPass is Now Active – Start Your Language Journey.",
    html: `
      <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6;">
        <h2>Hi ${name},</h2>
        <p>Greetings from the <b>Indian School for Modern Languages</b> Family! We’re overjoyed to welcome you to our community of passionate learners.</p>

        <h3>🎉 You’re now an Elite Member with <b>ISML ScholarPass</b></h3>
        <ul>
          <li>✅ Validity: 2 Years</li>
          <li>✅ Language Access: Up to 3 Languages (French, German, Japanese)</li>
          <li>✅ Mode: Online + Offline</li>
          <li>✅ Your ScholarPass ID: <b>${cardNumber}</b></li>
        </ul>

        <h3>✨ Your ScholarPass Benefits:</h3>
        <ul>
          <li>✅ Online Course Access</li>
          <li>✅ Offline Centre Access</li>
          <li>✅ 10% Discount – ML Courses & ID Fastrack</li>
          <li>✅ 12% Discount – ID Programs & Immersion</li>
          <li>✅ Study Abroad Guidance</li>
          <li>✅ 1-Month Certified Internship</li>
        </ul>

        <h3>📌 How to Start Using Your ScholarPass:</h3>
        <ol>
          <li>Choose up to 3 languages across 2 years (Online or Offline).</li>
          <li>Select your program: <a href="https://www.indianschoolformodernlanguages.com/courses">ML / ID / IMM</a></li>
          <li>Pick your day & time slot</li>
          <li>For online support call: <b>73388 81781</b></li>
          <li>For offline centres: <a href="https://www.indianschoolformodernlanguages.com/centres">Check availability</a></li>
        </ol>

        <h3>⚖️ Terms & Conditions:</h3>
        <ul>
          <li>ScholarPass is non-transferable, valid for 3 languages over 2 years.</li>
          <li>Discounts apply only to ISML-approved courses.</li>
          <li>Offline availability varies by city.</li>
          <li>Internship/placement depend on performance & slots.</li>
          <li>Discounts only on base fee (GST excluded).</li>
        </ul>

        <p>Thank you for choosing ISML. Your language journey begins today!</p>
        <p>For help: <a href="mailto:elitemembership.isml@gmail.com">elitemembership.isml@gmail.com</a> | Call: 93854 57322</p>
        <br>
        <p>Warm regards,<br><b>Team Elite Membership</b><br>Indian School for Modern Languages</p>
      </div>
    `,
  }),

  InfinitePass: (name, cardNumber) => ({
    subject: "Welcome to ISML! Your InfinityPass is Now Active – Start Your Language Journey.",
    html: `
      <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6;">
        <h2>Hi ${name},</h2>
        <p>Greetings from the <b>Indian School for Modern Languages</b> Family! We’re thrilled to welcome you to our community of passionate learners.</p>

        <h3>🎉 You’re now an Elite Member with <b>ISML InfinityPass</b></h3>
        <ul>
          <li>✅ Validity: 3 Years</li>
          <li>✅ Language Access: All Current & Upcoming Languages</li>
          <li>✅ Mode: Online + Offline</li>
          <li>✅ Your InfinityPass ID: <b>${cardNumber}</b></li>
          <li>✅ Discounts: Up to 15% off all ISML programs & certifications</li>
        </ul>

        <h3>✨ Your InfinityPass Additional Benefits:</h3>
        <ul>
          <li>✅ Online & Offline Access</li>
          <li>✅ Study Abroad Guidance</li>
          <li>✅ 3-Month Certified Internship</li>
          <li>✅ Placement Assistance & Priority Support</li>
        </ul>

        <h3>📌 How to Start Using Your InfinityPass:</h3>
        <ol>
          <li>Choose your languages across 3 years (Online or Offline).</li>
          <li>Select your program: <a href="https://www.indianschoolformodernlanguages.com/courses">ML / ID / IMM</a></li>
          <li>Pick your day & time slot</li>
          <li>For online support: Call <b>73388 81781</b></li>
          <li>For offline centres: <a href="https://www.indianschoolformodernlanguages.com/centres">Check availability</a></li>
        </ol>

        <h3>⚖️ Terms & Conditions:</h3>
        <ul>
          <li>InfinityPass is valid 3 years from activation date.</li>
          <li>Access subject to availability (online/offline).</li>
          <li>Discounts apply only to base fee (GST excluded).</li>
          <li>Discounts must be claimed before batch starts.</li>
          <li>Internship/placement depend on performance & seats.</li>
          <li>Study Abroad guidance is advisory (not full admission/visa).</li>
        </ul>

        <p>Thank you for choosing ISML. Your journey begins today!</p>
        <p>For help: <a href="mailto:elitemembership.isml@gmail.com">elitemembership.isml@gmail.com</a> | Call: 93854 57322</p>
        <br>
        <p>Warm regards,<br><b>Team Elite Membership</b><br>Indian School for Modern Languages</p>
      </div>
    `,
  }),
};

// ✅ Download PDF from Supabase URL
async function downloadFile(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return response.data;
}

// ✅ Send Mail Function
exports.sendCardMail = async (to, cardName, nameOnPass, cardNumber, pdfUrl) => {
  try {
    const templateFn = mailTemplates[cardName];
    if (!templateFn) throw new Error("Unknown card type: " + cardName);

    const { subject, html } = templateFn(nameOnPass, cardNumber);

    const pdfBuffer = await downloadFile(pdfUrl);

    await transporter.sendMail({
      from: `"ISML Elite Membership" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments: [
        {
          filename: `${cardName}_${cardNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log("✅ Mail sent to:", to);
  } catch (err) {
    console.error("❌ Mail error:", err.message);
  }
};
