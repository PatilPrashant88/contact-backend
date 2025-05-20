const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = (...args) => import("node-fetch").then((mod) => mod.default(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS & body parsing
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// POST /send route
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  // ✅ Replace these values if needed
  const adminEmail = "prashantpatil8329@gmail.com";
  const appPassword = "bvgpoqxwmzknhqpr";
  const googleSheetURL = "https://script.google.com/macros/s/AKfycbzhD_ySPJdoJ1ZdwG-cs2BB32wYcvoIo6fnQjJLRGrGENXdh4T8QBp_HZZSq-1bgnuIHA/exec";

  // Setup transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: adminEmail,
      pass: appPassword,
    },
  });

  // Email to Admin
  const adminMailOptions = {
    from: email,
    to: adminEmail,
    subject: "New Contact Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Confirmation Email to User
  const userMailOptions = {
    from: adminEmail,
    to: email,
    subject: "Thank you for contacting me!",
    text: `Thank you for contacting me.\n\nI will contact you soon.\n\n— Prashant Patil`,
  };

  try {
    // 1. Send email to admin
    await transporter.sendMail(adminMailOptions);
    console.log("✅ Admin email sent.");

    // 2. Fill Google Sheet
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

    // 3. Send confirmation email to user
    await transporter.sendMail(userMailOptions);
    console.log("✅ Confirmation email sent to user.");

    // Final response
    res.status(200).json({ message: "Emails sent and data saved successfully!" });
  } catch (error) {
    console.error("❌ Main Error:", error);
    res.status(500).json({ message: "Failed to complete the process." });
  }
});
document.getElementById("contact-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  fetch("https://contact-backend-dem5.onrender.com", {  // ✅ Replace with your Render backend URL
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, message }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert("Thank you for contacting me. I’ll reply soon!");
      document.getElementById("contact-form").reset();
    })
    .catch((error) => {
      alert("Something went wrong. Please try again later.");
      console.error("Error:", error);
    });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
