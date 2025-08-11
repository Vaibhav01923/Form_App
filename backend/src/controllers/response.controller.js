import Response from "../models/response.model.js";
import Form from "../models/form.model.js";

export const submitResponse = async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body;

    if (!formId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Check if form exists and is active
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    if (!form.isActive) {
      return res
        .status(400)
        .json({ message: "Form is not accepting responses" });
    }

    const respondentId = req.user?._id || null;

    // Check if user has already submitted a response for this form
    if (respondentId) {
      const existingResponse = await Response.findOne({
        formId,
        respondentId,
      });

      if (existingResponse) {
        return res.status(400).json({
          message: "You have already submitted a response for this form",
          alreadySubmitted: true,
        });
      }
    }

    // Create new response
    const newResponse = new Response({
      formId,
      respondentId,
      answers,
    });

    await newResponse.save();

    res.status(201).json({
      message: "Response submitted successfully",
      responseId: newResponse._id,
      response: newResponse,
    });
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkUserResponse = async (req, res) => {
  try {
    const { formId } = req.params;
    const respondentId = req.user?._id;

    if (!respondentId) {
      return res.status(200).json({ hasSubmitted: false });
    }

    const existingResponse = await Response.findOne({
      formId,
      respondentId,
    });

    res.status(200).json({
      hasSubmitted: !!existingResponse,
      response: existingResponse,
    });
  } catch (error) {
    console.error("Error checking user response:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFormResponses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { formId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // First verify that the user owns this form
    const form = await Form.findOne({
      _id: formId,
      ownerId: userId,
    });

    if (!form) {
      return res
        .status(404)
        .json({ message: "Form not found or you don't have access" });
    }

    // Get all responses for this form
    const responses = await Response.find({ formId })
      .populate("respondentId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      form: {
        _id: form._id,
        title: form.title,
        slug: form.slug,
      },
      responses,
      totalResponses: responses.length,
    });
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ message: "Server error" });
  }
};
