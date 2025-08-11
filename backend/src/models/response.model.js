import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
});

const responseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    respondentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    answers: { type: [answerSchema], required: true },
  },
  { timestamps: true }
);

const Response = mongoose.model("Response", responseSchema);

export default Response;
