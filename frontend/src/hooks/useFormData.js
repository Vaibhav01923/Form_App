import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useFormData = (id) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userResponse, setUserResponse] = useState(null);
  const [responses, setResponses] = useState({});

  const getInitialResponse = (questionType) => {
    switch (questionType) {
      case "categorize":
        return {};
      case "cloze":
        return {};
      case "comprehension":
        return {};
      default:
        return "";
    }
  };

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/forms/getPublic/${id}`);
        setForm(response.data);

        // Check if user has already submitted
        try {
          const checkResponse = await axiosInstance.get(
            `/responses/check/${response.data._id}`
          );
          if (checkResponse.data.hasSubmitted) {
            setHasSubmitted(true);
            setUserResponse(checkResponse.data.response);
          }
        } catch (error) {
          console.log("Error checking user response:", error);
        }

        // Initialize responses object
        const initialResponses = {};
        response.data.questions.forEach((question) => {
          initialResponses[question._id] = getInitialResponse(question.type);
        });
        setResponses(initialResponses);
      } catch (error) {
        console.error("Error fetching form:", error);
        toast.error("Form not found or inactive");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchForm();
    }
  }, [id]);

  const handleResponseChange = (questionId, response) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: response,
    }));
  };

  return {
    form,
    loading,
    hasSubmitted,
    userResponse,
    responses,
    handleResponseChange,
    setHasSubmitted,
    setUserResponse,
  };
};
