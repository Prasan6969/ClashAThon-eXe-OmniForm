const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    panNumber: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    location: { type: String, trim: true },
    subscriptionStatus: {
      type: String,
      enum: ["active", "canceled", "expired"],
      default: "active",
    },
    subscriptionStartsAt: { type: Date },
    subscriptionEndsAt: { type: Date },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

OrganizationSchema.index({ name: "text" });

module.exports = mongoose.model("Organization", OrganizationSchema);
