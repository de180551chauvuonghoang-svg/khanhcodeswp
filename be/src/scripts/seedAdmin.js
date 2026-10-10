require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function seedAdmin() {
  const { MONGODB_URI } = process.env;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const targetEmail = "hieu33tran@gmail.com";
  const user = await User.findOneAndUpdate(
    { email: targetEmail },
    { $set: { role: "Systemadmin" } },
    { new: true }
  );

  if (user) {
    console.log(`Success: Updated ${user.email} to role '${user.role}'`);
  } else {
    console.log(`User ${targetEmail} not found in database.`);
  }

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error("Error updating admin role:", err);
  process.exit(1);
});
