const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    primary: {
      fullName: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true },
      dob: { type: String, trim: true },
    },
    extra: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", UserProfileSchema);
