import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useFormData } from "../hooks/useFormData";
import { useAuthStore } from "../store/useAuthStore";
import FormHeader from "../components/form/FormHeader";
import SubmittedMessage from "../components/form/SubmittedMessage";
import QuestionRenderer from "../components/form/QuestionRenderer";
import SubmitButton from "../components/form/SubmitButton";
import ResultsHeader from "../components/results/ResultsHeader";
import ResultsView from "../components/results/ResultsView";

const PublicFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { authUser } = useAuthStore();

  const {
    form,
    loading,
    hasSubmitted,
    userResponse,
    responses,
    handleResponseChange,
    setHasSubmitted,
    setUserResponse,
  } = useFormData(id);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Convert responses to the format expected by backend
      const answers = Object.entries(responses).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const response = await axiosInstance.post(
        `/responses/submit/${form._id}`,
        {
          answers,
        }
      );

      toast.success("Form submitted successfully!");
      setHasSubmitted(true);
      setUserResponse(response.data.response);
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response?.data?.alreadySubmitted) {
        toast.error("You have already submitted a response for this form");
        setHasSubmitted(true);
      } else {
        toast.error("Failed to submit form. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Form not found
          </h2>
          <p className="text-gray-600 mb-4">
            This form may be inactive or the link is incorrect.
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        <FormHeader form={form} />

        {hasSubmitted && !showResults && (
          <SubmittedMessage onViewResults={() => setShowResults(true)} />
        )}

        {showResults && userResponse && (
          <div className="space-y-6">
            <ResultsHeader userResponse={userResponse} />

            {form.questions.map((question, index) => {
              const userAnswer = userResponse.answers.find(
                (a) => a.questionId === question._id
              );
              return (
                <div
                  key={question._id}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Question {index + 1}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded capitalize">
                        {question.type}
                      </span>
                    </div>
                  </div>
                  <ResultsView
                    question={question}
                    userAnswer={userAnswer?.answer}
                  />
                </div>
              );
            })}

            {authUser && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <button
                  onClick={() => navigate("/")}
                  className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>
        )}

        {!hasSubmitted && !showResults && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.questions.map((question, index) => (
              <QuestionRenderer
                key={question._id}
                question={question}
                index={index}
                response={responses[question._id]}
                onChange={(response) =>
                  handleResponseChange(question._id, response)
                }
              />
            ))}
            <SubmitButton submitting={submitting} />
          </form>
        )}
      </div>
    </div>
  );
};

export default PublicFormPage;
