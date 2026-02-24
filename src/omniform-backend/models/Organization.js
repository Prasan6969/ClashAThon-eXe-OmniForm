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
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

OrganizationSchema.index({ name: "text" });

module.exports = mongoose.model("Organization", OrganizationSchema);
