import React from "react";
import CategorizeQuestion from "../questions/CategorizeQuestion";
import ClozeQuestion from "../questions/ClozeQuestion";
import ComprehensionQuestion from "../questions/ComprehensionQuestion";

const QuestionRenderer = ({ question, index, response, onChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
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

      {question.type === "categorize" && (
        <CategorizeQuestion
          question={question}
          response={response}
          onChange={onChange}
        />
      )}

      {question.type === "cloze" && (
        <ClozeQuestion
          question={question}
          response={response}
          onChange={onChange}
        />
      )}

      {question.type === "comprehension" && (
        <ComprehensionQuestion
          question={question}
          response={response}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default QuestionRenderer;
