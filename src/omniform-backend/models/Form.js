const mongoose = require("mongoose");

const FormComponentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    tag: { type: String, trim: true },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
  },
  { _id: false }
);

const FormSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    components: [FormComponentSchema],
    fields: [FormComponentSchema],
  },
  { timestamps: true }
);

FormSchema.index({ name: "text" });

module.exports = mongoose.model("Form", FormSchema);
