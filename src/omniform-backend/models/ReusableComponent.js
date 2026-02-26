const mongoose = require("mongoose");

const ReusableComponentSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    tag: { type: String, required: true, trim: true },
    iconName: { type: String, required: true, trim: true, default: "type" },
    options: { type: String, trim: true, default: "" },
    createdBy: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReusableComponentSchema.index({ isActive: 1, label: 1 });

module.exports = mongoose.model("ReusableComponent", ReusableComponentSchema);
