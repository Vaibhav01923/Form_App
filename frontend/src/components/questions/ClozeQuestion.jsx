import React from "react";

const ClozeQuestion = ({ question, response = {}, onChange }) => {
  const handleBlankChange = (blankIndex, value) => {
    const newResponse = { ...response };
    newResponse[blankIndex] = value;
    onChange(newResponse);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Fill in the blanks
      </h3>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-700 leading-relaxed">
          {question.data.sentence}
        </p>
      </div>

      <div className="space-y-3">
        {question.data.blanks?.map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 w-20">
              Blank {index + 1}:
            </span>
            <input
              type="text"
              value={(response && response[index]) || ""}
              onChange={(e) => handleBlankChange(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your answer..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClozeQuestion;
