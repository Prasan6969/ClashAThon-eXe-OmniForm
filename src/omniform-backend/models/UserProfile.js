const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    fullName: { type: String, trim: true },
    workEmail: { type: String, trim: true, lowercase: true },
    personalEmail: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    citizenshipNumber: { type: String, trim: true },
    passportSizePhotoUrl: { type: String, trim: true },
    profilePhotoUrl: { type: String, trim: true },
    citizenshipPhotoUrl: { type: String, trim: true },
    customFields: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", UserProfileSchema);
