import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Calendar, Download } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const FormResponsesPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getFormResponses } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!formId) return;

      try {
        setLoading(true);
        const data = await getFormResponses(formId);
        setResponses(data.responses || []);
        setForm(data.form);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load responses");
        setResponses([]);
        setForm(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const checkAnswerCorrectness = (userAnswer, correctAnswer) => {
    if (!correctAnswer || !userAnswer) return false;

    // Handle different answer types
    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
      // For arrays (like cloze questions), compare each element
      if (userAnswer.length !== correctAnswer.length) return false;
      return userAnswer.every(
        (answer, index) =>
          String(answer).toLowerCase().trim() ===
          String(correctAnswer[index]).toLowerCase().trim()
      );
    } else if (
      typeof correctAnswer === "object" &&
      typeof userAnswer === "object"
    ) {
      // For objects (like categorize questions), compare each key-value pair
      const correctKeys = Object.keys(correctAnswer);
      const userKeys = Object.keys(userAnswer);

      if (correctKeys.length !== userKeys.length) return false;

      return correctKeys.every(
        (key) =>
          String(userAnswer[key]).toLowerCase().trim() ===
          String(correctAnswer[key]).toLowerCase().trim()
      );
    } else {
      // For simple string answers
      return (
        String(userAnswer).toLowerCase().trim() ===
        String(correctAnswer).toLowerCase().trim()
      );
    }
  };

  const exportToCSV = () => {
    if (responses.length === 0) {
      toast.error("No responses to export");
      return;
    }

    // Simple CSV with just basic info - teacher can see detailed responses on screen
    const headers = ["Submitted At", "User"];

    const csvRows = responses.map((response) => [
      formatDate(response.createdAt),
      response.respondentId?.username || "Anonymous",
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form?.title || "form"}-responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Responses exported successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading responses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 mt-2">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Form Responses
              </h1>
              <p className="text-gray-600 mt-1">
                {form?.title || "Loading..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2" />
              <span>{responses.length} responses</span>
            </div>
            {responses.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {responses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No responses yet
            </h3>
            <p className="text-gray-600">
              Share your form to start collecting responses
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((response, index) => (
              <div
                key={response._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                      Response #{index + 1}
                    </span>
                    <span className="text-gray-600">
                      {response.respondentId?.username || "Anonymous"}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(response.createdAt)}
                  </div>
                </div>

                <div className="space-y-6">
                  {response.answers?.map((answer, answerIndex) => {
                    // Debug logging - expand objects to see structure
                    console.log(
                      "Answer object:",
                      JSON.stringify(answer, null, 2)
                    );
                    console.log(
                      "Form questions:",
                      JSON.stringify(form?.questions, null, 2)
                    );

                    // Find the corresponding question from the form by questionId
                    const question = form?.questions?.find(
                      (q) => q._id === answer.questionId
                    );

                    console.log(
                      "Matched question:",
                      JSON.stringify(question, null, 2)
                    );

                    // Extract correct answer based on question type
                    let correctAnswer = null;
                    if (question) {
                      switch (question.type) {
                        case "categorize":
                          // For categorize, create correct answer object from items
                          correctAnswer = {};
                          question.data.items.forEach((item, index) => {
                            correctAnswer[index] = item.category;
                          });
                          break;
                        case "cloze":
                          // For cloze, get answers from blanks
                          correctAnswer = {};
                          question.data.blanks.forEach((blank, index) => {
                            correctAnswer[index] = blank.answer;
                          });
                          break;
                        case "comprehension":
                          // For comprehension, get from questions array
                          correctAnswer = {};
                          question.data.questions.forEach((q, index) => {
                            correctAnswer[index] = q.correctAnswer;
                          });
                          break;
                      }
                    }

                    // Check if answer is correct
                    const isCorrect = checkAnswerCorrectness(
                      answer.answer,
                      correctAnswer
                    );

                    return (
                      <div
                        key={answerIndex}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mr-2">
                              Q{answerIndex + 1}
                            </span>
                            <h4 className="inline font-semibold text-gray-900 text-lg">
                              {answer.questionText}
                            </h4>
                          </div>

                          {/* Correct/Incorrect indicator */}
                          <div className="flex items-center">
                            {isCorrect ? (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Correct
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Incorrect
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="ml-6 space-y-3">
                          {/* Student's Answer */}
                          <div
                            className={`bg-white border-l-4 p-4 rounded-r-lg shadow-sm ${
                              isCorrect ? "border-green-400" : "border-red-400"
                            }`}
                          >
                            <div className="flex items-start">
                              <span
                                className={`font-medium text-sm mr-2 ${
                                  isCorrect ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                Student Answer:
                              </span>
                              <div className="flex-1">
                                {Array.isArray(answer.answer) ? (
                                  <ul className="space-y-1">
                                    {answer.answer.map((item, i) => (
                                      <li key={i} className="flex items-start">
                                        <span
                                          className={`mr-2 ${
                                            isCorrect
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          •
                                        </span>
                                        <span className="text-gray-800">
                                          {String(item)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : typeof answer.answer === "object" &&
                                  answer.answer !== null ? (
                                  <ul className="space-y-1">
                                    {Object.values(answer.answer).map(
                                      (item, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start"
                                        >
                                          <span
                                            className={`mr-2 ${
                                              isCorrect
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                          >
                                            •
                                          </span>
                                          <span className="text-gray-800">
                                            {String(item)}
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                ) : (
                                  <p className="text-gray-800 font-medium">
                                    {String(
                                      answer.answer || "No answer provided"
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Correct Answer (show if student was wrong) */}
                          {!isCorrect && correctAnswer && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                              <div className="flex items-start">
                                <span className="text-green-600 font-medium text-sm mr-2">
                                  Correct Answer:
                                </span>
                                <div className="flex-1">
                                  {Array.isArray(correctAnswer) ? (
                                    <ul className="space-y-1">
                                      {correctAnswer.map((item, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start"
                                        >
                                          <span className="text-green-600 mr-2">
                                            •
                                          </span>
                                          <span className="text-gray-800 font-medium">
                                            {String(item)}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : typeof correctAnswer === "object" &&
                                    correctAnswer !== null ? (
                                    <ul className="space-y-1">
                                      {Object.values(correctAnswer).map(
                                        (item, i) => (
                                          <li
                                            key={i}
                                            className="flex items-start"
                                          >
                                            <span className="text-green-600 mr-2">
                                              •
                                            </span>
                                            <span className="text-gray-800 font-medium">
                                              {String(item)}
                                            </span>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  ) : (
                                    <p className="text-gray-800 font-medium">
                                      {String(correctAnswer)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormResponsesPage;
