const mongoose = require("mongoose");

const ProfileTagSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    tag: { type: String, required: true, trim: true, unique: true },
    type: {
      type: String,
      enum: ["text", "email", "date", "number", "image", "select"],
      default: "text",
    },
    options: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProfileTag", ProfileTagSchema);
