import React from "react";

const SubmittedMessage = ({ onViewResults }) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Already Submitted
          </h3>
          <p className="text-yellow-700">
            You have already submitted a response for this form.
          </p>
        </div>
        <button
          onClick={onViewResults}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          View My Response
        </button>
      </div>
    </div>
  );
};

export default SubmittedMessage;
