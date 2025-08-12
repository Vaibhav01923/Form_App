import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home } from "lucide-react";

const ThankYouPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Thank You!
            </h1>
            <p className="text-gray-600">
              Your form has been submitted successfully. We appreciate your
              response!
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
