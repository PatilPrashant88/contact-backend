const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = (...args) => import("node-fetch").then((mod) => mod.default(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  const adminEmail = "prashantpatil8329@gmail.com";
  const appPassword = "bvgpoqxwmzknhqpr";
  const googleSheetURL = "https://script.google.com/macros/s/AKfycbzhD_ySPJdoJ1ZdwG-cs2BB32wYcvoIo6fnQjJLRGrGENXdh4T8QBp_HZZSq-1bgnuIHA/exec";

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: adminEmail,
      pass: appPassword
    }
  });

  const adminMailOptions = {
    from: email,
    to: adminEmail,
    subject: "New Contact Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  const userMailOptions = {
    from: adminEmail,
    to: email,
    subject: "Thank you for contacting me!",
    text: `Thank you for contacting me.\n\nI will contact to you soon.`,
  };

  try {
    // 1. Send mail to admin
    await transporter.sendMail(adminMailOptions);
    console.log("✅ Admin email sent.");

    // 2. Send data to Google Sheet
    try {
      const sheetResponse = await fetch(googleSheetURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (!sheetResponse.ok) {
        throw new Error("Failed to store data in Google Sheet");
      }

      console.log("✅ Data stored in Google Sheet.");
    } catch (sheetError) {
      console.error("❌ Google Sheet Error:", sheetError);
    }

    // 3. Send confirmation to user
    await transporter.sendMail(userMailOptions);
    console.log("✅ Confirmation email sent to user.");

    res.status(200).json({ message: "Emails sent and data saved successfully!" });
  } catch (error) {
    console.error("❌ Main Error:", error);
    res.status(500).json({ message: "Failed to complete the process." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
