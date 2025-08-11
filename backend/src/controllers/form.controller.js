import Form from "../models/form.model.js";

export const createForm = async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { title, imageUrl, questions } = req.body;
  try {
    const questionsArray = questions || [];

    // Forms start as inactive (draft) if no questions, active if they have questions
    const isActive = questionsArray.length > 0;

    const newForm = new Form({
      ownerId: userId,
      title: title || "Untitled Form",
      imageUrl: imageUrl || "",
      questions: questionsArray,
      isActive,
    });
    await newForm.save();
    res.status(201).json(newForm);
  } catch (error) {
    1;
    console.error("Error creating form:", error);
    console.error("Error details:", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: error.message,
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getForms = async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const forms = await Form.find({ ownerId: userId })
      .sort({ createdAt: -1 })
      .select("title imageUrl isActive createdAt questions");
    const totalForms = forms.length;
    const activeForms = forms.filter((form) => form.isActive).length;
    res.status(200).json({
      stats: {
        totalForms,
        activeForms,
      },
      forms: forms.map((f) => ({
        _id: f._id,
        title: f.title,
        imageUrl: f.imageUrl,
        isActive: f.isActive,
        createdAt: f.createdAt,
        questionsCount: f.questions.length,
      })),
    });
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFormById = async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const form = await Form.findById({
      _id: req.params.id,
      ownerId: userId,
    });
    if (!form) {
      return res.status(404).json({ message: "Form not found/No Access" });
    }
    res.status(200).json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPublicForm = async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("title imageUrl questions");
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.status(200).json(form);
  } catch (error) {
    console.error("Error fetching public form:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const editForm = async (req, res) => {
  const userId = req.user._id;
  const { title, imageUrl, questions, isActive } = req.body;
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      ownerId: userId,
    });
    if (!form) {
      return res.status(404).json({ message: "Form not found/nNo Access" });
    }

    // Validate: Don't allow activating forms without questions
    if (
      isActive === true &&
      (!questions || questions.length === 0) &&
      (!form.questions || form.questions.length === 0)
    ) {
      return res.status(400).json({
        message:
          "Cannot activate form without questions. Please add at least one question.",
      });
    }

    if (title !== undefined) form.title = title;
    if (imageUrl !== undefined) form.imageUrl = imageUrl;
    if (questions !== undefined) form.questions = questions;
    if (isActive !== undefined) form.isActive = isActive;
    form.updatedAt = new Date();
    const updatedForm = await form.save();
    res.status(200).json(updatedForm);
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "form-images", // Organize images in a folder
      resource_type: "image",
      transformation: [
        { width: 800, height: 600, crop: "limit" }, // Limit max size
        { quality: "auto" }, // Auto optimize quality
        { format: "auto" }, // Auto choose best format
      ],
    });

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res
      .status(500)
      .json({ message: "Error uploading image", error: error.message });
  }
};
