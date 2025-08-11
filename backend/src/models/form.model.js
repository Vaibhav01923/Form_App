import mongoose from "mongoose";

const questionSchema = mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["categorize", "cloze", "comprehension"],
  },
  data: {
    type: Object,
    required: true,
  },
});

const formSchema = mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    questions: [questionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Form = mongoose.model("Form", formSchema);
export default Form;
