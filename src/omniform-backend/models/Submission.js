const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
    data: { type: Object, default: {} },
    reviewNotes: { type: String, trim: true },
    reviewedBy: { type: String, trim: true },
    cooldownUntil: { type: Date },
  },
  { timestamps: true }
);

SubmissionSchema.index({ userId: 1, formId: 1, status: 1 });

module.exports = mongoose.model("Submission", SubmissionSchema);
