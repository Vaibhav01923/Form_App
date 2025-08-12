import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Plus, Edit3, Trash2, Save, ArrowLeft, Settings } from "lucide-react";
import toast from "react-hot-toast";
import FormImageEditor from "../components/form/FormImageEditor";

const FormEditPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { getFormById } = useAuthStore();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showEditQuestion, setShowEditQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    type: "categorize",
    data: {},
  });
  const [formTitle, setFormTitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isFormActive, setIsFormActive] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const response = await getFormById(formId);
        setForm(response);
        setQuestions(response.questions || []);
        setFormTitle(response.title || "");
        setFormImageUrl(response.imageUrl || "");
        setIsFormActive(response.isActive || false);
      } catch (error) {
        console.error("Error fetching form:", error);
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchForm();
    }
  }, [formId, getFormById]);

  const handleAddQuestion = () => {
    if (validateQuestionData()) {
      const question = {
        _id: Date.now().toString(), // Temporary ID for new questions
        type: newQuestion.type,
        data: newQuestion.data,
      };
      setQuestions([...questions, question]);
      setNewQuestion({
        type: "categorize",
        data: {},
      });
      setShowAddQuestion(false);
    }
  };

  const validateQuestionData = () => {
    const { type, data } = newQuestion;

    switch (type) {
      case "categorize":
        return (
          data.question &&
          data.categories &&
          data.items &&
          data.categories.length > 0 &&
          data.items.length > 0
        );
      case "cloze":
        return data.sentence && data.blanks && data.blanks.length > 0;
      case "comprehension":
        return data.passage && data.questions && data.questions.length > 0;
      default:
        return false;
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion({ ...question });
    setShowEditQuestion(true);
  };

  const handleUpdateQuestion = () => {
    if (validateEditQuestionData()) {
      const updatedQuestions = questions.map((q) =>
        q._id === editingQuestion._id ? editingQuestion : q
      );
      setQuestions(updatedQuestions);
      setShowEditQuestion(false);
      setEditingQuestion(null);
    }
  };

  const validateEditQuestionData = () => {
    const { type, data } = editingQuestion;

    switch (type) {
      case "categorize":
        return (
          data.question &&
          data.categories &&
          data.items &&
          data.categories.length > 0 &&
          data.items.length > 0
        );
      case "cloze":
        return data.sentence && data.blanks && data.blanks.length > 0;
      case "comprehension":
        return data.passage && data.questions && data.questions.length > 0;
      default:
        return false;
    }
  };

  const handleDeleteQuestion = (questionId) => {
    const newQuestions = questions.filter((q) => q._id !== questionId);
    setQuestions(newQuestions);

    // If we're removing the last question and form is active, deactivate it
    if (newQuestions.length === 0 && isFormActive) {
      setIsFormActive(false);
      toast.info("Form deactivated because all questions were removed.");
    }
  };

  const handleToggleActive = (newActiveStatus) => {
    if (newActiveStatus && questions.length === 0) {
      toast.error(
        "Cannot activate form without questions. Please add at least one question first."
      );
      return;
    }
    setIsFormActive(newActiveStatus);
  };

  const handleSaveForm = async () => {
    try {
      console.log("Form object:", form);
      console.log("Questions:", questions);

      if (!form._id) {
        console.error("Form id is missing!");
        toast.error("Form id is missing. Cannot update form.");
        return;
      }

      const cleanedQuestions = questions.map((question) => {
        const cleanedQuestion = {
          type: question.type,
          data: question.data,
        };

        if (
          question._id &&
          question._id.length === 24 &&
          /^[0-9a-fA-F]{24}$/.test(question._id)
        ) {
          cleanedQuestion._id = question._id;
        }

        return cleanedQuestion;
      });

      console.log("Cleaned questions:", cleanedQuestions);

      // Check if form can be active (must have questions)
      const canBeActive = cleanedQuestions.length > 0;
      const finalActiveStatus = isFormActive && canBeActive;

      // Show warning if user tried to activate form without questions
      if (isFormActive && !canBeActive) {
        toast.error(
          "Cannot activate form without questions. Please add at least one question."
        );
      }

      const { editForm } = useAuthStore.getState();
      await editForm(form._id, {
        title: formTitle,
        imageUrl: formImageUrl,
        questions: cleanedQuestions,
        isActive: finalActiveStatus,
      });

      // Update local form state to reflect the new active status
      setForm((prev) => ({ ...prev, isActive: finalActiveStatus }));
      setIsFormActive(finalActiveStatus);

      // Show additional status message if activation status changed
      if (finalActiveStatus !== form.isActive) {
        if (finalActiveStatus) {
          toast.success("Form is now active and accepting responses!");
        } else {
          toast.info("Form is now inactive and not accepting responses.");
        }
      }
    } catch (error) {
      console.error("Error saving form:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen pt-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Form not found
          </h2>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Forms
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleSaveForm}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>

          <div className="flex items-start gap-6">
            {/* Form Image */}
            <div className="flex-shrink-0 w-32 h-32">
              <FormImageEditor
                currentImageUrl={formImageUrl}
                onImageUpdate={setFormImageUrl}
                className="w-full h-full"
              />
            </div>

            {/* Form Details */}
            <div className="flex-1 min-w-0">
              {/* Editable Title */}
              <div className="mb-2">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-500 focus:outline-none flex-1"
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setIsEditingTitle(false);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h1 className="text-3xl font-bold text-gray-800 truncate">
                      {formTitle}
                    </h1>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-3">Form ID: {form._id}</p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      form.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Active/Inactive Toggle */}
                <div className="flex items-center gap-2">
                  <label
                    className={`flex items-center ${
                      questions.length === 0
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isFormActive}
                      onChange={(e) => handleToggleActive(e.target.checked)}
                      disabled={questions.length === 0}
                      className="sr-only"
                    />
                    <div
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isFormActive
                          ? "bg-green-600"
                          : questions.length === 0
                          ? "bg-gray-200"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isFormActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-700">
                      {isFormActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                  {questions.length === 0 && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Add questions to activate
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
            <button
              onClick={() => setShowAddQuestion(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </button>
          </div>

          {/* Existing Questions */}
          <div className="space-y-4 mb-6">
            {questions.map((question, index) => (
              <div
                key={question._id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Question {index + 1}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded capitalize">
                        {question.type}
                      </span>
                    </div>

                    {/* Render question based on type */}
                    {question.type === "categorize" && (
                      <div>
                        <p className="text-gray-800 font-medium mb-2">
                          {question.data.question}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1">Categories:</p>
                            <ul className="list-disc list-inside text-gray-700">
                              {question.data.categories?.map((cat, idx) => (
                                <li key={idx}>{cat}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Items:</p>
                            <ul className="list-disc list-inside text-gray-700">
                              {question.data.items?.map((item, idx) => (
                                <li key={idx}>{item.text}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {question.type === "cloze" && (
                      <div>
                        <p className="text-gray-800 font-medium mb-2">
                          Fill in the blanks
                        </p>
                        <p className="text-gray-700 mb-2">
                          {question.data.sentence}
                        </p>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Answers:</p>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {question.data.blanks?.map((blank, idx) => (
                              <li key={idx}>{blank.answer}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {question.type === "comprehension" && (
                      <div>
                        <p className="text-gray-800 font-medium mb-2">
                          Reading Comprehension
                        </p>
                        <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                          {question.data.passage}
                        </p>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Questions ({question.data.questions?.length}):
                          </p>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {question.data.questions
                              ?.slice(0, 2)
                              .map((q, idx) => (
                                <li key={idx}>{q.question}</li>
                              ))}
                            {question.data.questions?.length > 2 && (
                              <li className="text-gray-500">
                                +{question.data.questions.length - 2} more...
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="p-2 text-gray-600 hover:text-blue-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question._id)}
                      className="p-2 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">
                No questions added yet. Click "Add Question" to get started.
              </p>
              <p className="text-sm text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded">
                ⚠️ Forms need at least one question to be activated
              </p>
            </div>
          )}
        </div>

        {/* Add Question Modal */}
        {showAddQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Add New Question</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) => {
                      setNewQuestion({
                        type: e.target.value,
                        data: {},
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="categorize">Categorize</option>
                    <option value="cloze">Cloze (Fill in the blanks)</option>
                    <option value="comprehension">Reading Comprehension</option>
                  </select>
                </div>

                {/* Categorize Question Form */}
                {newQuestion.type === "categorize" && (
                  <CategorizeQuestionForm
                    data={newQuestion.data}
                    onChange={(data) =>
                      setNewQuestion({ ...newQuestion, data })
                    }
                  />
                )}

                {/* Cloze Question Form */}
                {newQuestion.type === "cloze" && (
                  <ClozeQuestionForm
                    data={newQuestion.data}
                    onChange={(data) =>
                      setNewQuestion({ ...newQuestion, data })
                    }
                  />
                )}

                {/* Comprehension Question Form */}
                {newQuestion.type === "comprehension" && (
                  <ComprehensionQuestionForm
                    data={newQuestion.data}
                    onChange={(data) =>
                      setNewQuestion({ ...newQuestion, data })
                    }
                  />
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAddQuestion}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Question
                </button>
                <button
                  onClick={() => setShowAddQuestion(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Question Modal */}
        {showEditQuestion && editingQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Edit Question</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <select
                    value={editingQuestion.type}
                    onChange={(e) => {
                      setEditingQuestion({
                        ...editingQuestion,
                        type: e.target.value,
                        data: {},
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="categorize">Categorize</option>
                    <option value="cloze">Cloze (Fill in the blanks)</option>
                    <option value="comprehension">Reading Comprehension</option>
                  </select>
                </div>

                {/* Categorize Question Form */}
                {editingQuestion.type === "categorize" && (
                  <CategorizeQuestionForm
                    data={editingQuestion.data}
                    onChange={(data) =>
                      setEditingQuestion({ ...editingQuestion, data })
                    }
                  />
                )}

                {/* Cloze Question Form */}
                {editingQuestion.type === "cloze" && (
                  <ClozeQuestionForm
                    data={editingQuestion.data}
                    onChange={(data) =>
                      setEditingQuestion({ ...editingQuestion, data })
                    }
                  />
                )}

                {/* Comprehension Question Form */}
                {editingQuestion.type === "comprehension" && (
                  <ComprehensionQuestionForm
                    data={editingQuestion.data}
                    onChange={(data) =>
                      setEditingQuestion({ ...editingQuestion, data })
                    }
                  />
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleUpdateQuestion}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Question
                </button>
                <button
                  onClick={() => {
                    setShowEditQuestion(false);
                    setEditingQuestion(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Question Form Components
const CategorizeQuestionForm = ({ data, onChange }) => {
  const [categories, setCategories] = useState(data.categories || []);
  const [items, setItems] = useState(data.items || []);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState({ text: "", category: "" });

  useEffect(() => {
    onChange({
      ...data,
      question: data.question || "",
      categories,
      items,
    });
  }, [categories, items, data.question]);

  const addCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const removeCategory = (index) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
    // Remove items that belong to this category
    setItems(items.filter((item) => item.category !== categories[index]));
  };

  const addItem = () => {
    if (newItem.text.trim() && newItem.category) {
      setItems([...items, { ...newItem, text: newItem.text.trim() }]);
      setNewItem({ text: "", category: "" });
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question
        </label>
        <input
          type="text"
          value={data.question || ""}
          onChange={(e) => onChange({ ...data, question: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Categorize the following items..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categories
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add category..."
          />
          <button
            type="button"
            onClick={addCategory}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {category}
              <button
                type="button"
                onClick={() => removeCategory(index)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Items to Categorize
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newItem.text}
            onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Item text..."
          />
          <select
            value={newItem.category}
            onChange={(e) =>
              setNewItem({ ...newItem, category: e.target.value })
            }
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <span>
                <strong>{item.text}</strong> → {item.category}
              </span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ClozeQuestionForm = ({ data, onChange }) => {
  const [sentence, setSentence] = useState(data.sentence || "");
  const [blanks, setBlanks] = useState(data.blanks || []);

  useEffect(() => {
    onChange({
      ...data,
      sentence,
      blanks,
    });
  }, [sentence, blanks]);

  const addBlank = () => {
    setBlanks([...blanks, { answer: "", position: blanks.length }]);
  };

  const updateBlank = (index, answer) => {
    const newBlanks = [...blanks];
    newBlanks[index] = { ...newBlanks[index], answer };
    setBlanks(newBlanks);
  };

  const removeBlank = (index) => {
    setBlanks(blanks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sentence with Blanks
        </label>
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
          placeholder="Enter sentence with _____ for blanks..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Use _____ (underscores) to indicate where blanks should appear
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Blank Answers
          </label>
          <button
            type="button"
            onClick={addBlank}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Add Blank
          </button>
        </div>
        <div className="space-y-2">
          {blanks.map((blank, index) => (
            <div key={index} className="flex gap-2">
              <span className="px-2 py-2 bg-gray-100 rounded text-sm">
                Blank {index + 1}:
              </span>
              <input
                type="text"
                value={blank.answer}
                onChange={(e) => updateBlank(index, e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Correct answer..."
              />
              <button
                type="button"
                onClick={() => removeBlank(index)}
                className="p-2 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ComprehensionQuestionForm = ({ data, onChange }) => {
  const [passage, setPassage] = useState(data.passage || "");
  const [questions, setQuestions] = useState(data.questions || []);

  // Update local state when data prop changes (for editing)
  useEffect(() => {
    setPassage(data.passage || "");
    // Ensure existing questions have optionsText field for textarea
    const questionsWithText = (data.questions || []).map((q) => ({
      ...q,
      optionsText: q.optionsText || (q.options ? q.options.join("\n") : ""),
    }));
    setQuestions(questionsWithText);
  }, [data.passage, data.questions]);

  // Simple function to notify parent of changes
  const notifyChange = (newPassage, newQuestions) => {
    onChange({
      ...data,
      passage: newPassage,
      questions: newQuestions,
    });
  };

  const handlePassageChange = (newPassage) => {
    setPassage(newPassage);
    notifyChange(newPassage, questions);
  };

  const addQuestion = () => {
    const newQuestions = [
      ...questions,
      { question: "", options: [], optionsText: "", correctAnswer: "" },
    ];
    setQuestions(newQuestions);
    notifyChange(passage, newQuestions);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
    notifyChange(passage, newQuestions);
  };

  const updateOptions = (questionIndex, optionsText) => {
    const newQuestions = [...questions];
    // Store the raw text as optionsText and process it into options array
    const optionsArray = optionsText.split("\n").filter((opt) => opt.trim());
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      optionsText: optionsText, // Store raw text for textarea
      options: optionsArray, // Store processed array for logic
    };
    setQuestions(newQuestions);
    notifyChange(passage, newQuestions);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    notifyChange(passage, newQuestions);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reading Passage
        </label>
        <textarea
          value={passage}
          onChange={(e) => handlePassageChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="6"
          placeholder="Enter the reading passage..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Comprehension Questions
          </label>
          <button
            type="button"
            onClick={addQuestion}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Add Question
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Question {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <input
                type="text"
                value={question.question}
                onChange={(e) =>
                  updateQuestion(index, "question", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                placeholder="Enter question..."
              />

              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Answer Options (one per line)
                </label>
                <textarea
                  value={
                    question.optionsText || question.options?.join("\n") || ""
                  }
                  onChange={(e) => updateOptions(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter each option on a new line. Press Enter to add new
                  options. ({question.options?.length || 0} options)
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Correct Answer (must match one of the options above exactly)
                </label>
                <input
                  type="text"
                  value={question.correctAnswer}
                  onChange={(e) =>
                    updateQuestion(index, "correctAnswer", e.target.value)
                  }
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !question.correctAnswer
                      ? "border-red-300 bg-red-50"
                      : question.options?.includes(question.correctAnswer)
                      ? "border-green-300 bg-green-50"
                      : "border-yellow-300 bg-yellow-50"
                  }`}
                  placeholder="Enter the exact correct answer from options above..."
                />
                {!question.correctAnswer && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Correct answer is required for proper grading
                  </p>
                )}
                {question.correctAnswer &&
                  !question.options?.includes(question.correctAnswer) && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ Correct answer should match one of the options exactly
                    </p>
                  )}
                {question.correctAnswer &&
                  question.options?.includes(question.correctAnswer) && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Correct answer is valid
                    </p>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormEditPage;
