import React from "react";

const ResultsHeader = ({ userResponse }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        Your Response
      </h3>
      <p className="text-green-700">
        Submitted on {new Date(userResponse.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ResultsHeader;
