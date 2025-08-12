import React from "react";

const ComprehensionQuestion = ({ question, response = {}, onChange }) => {
  const handleAnswerChange = (questionIndex, answer) => {
    const newResponse = { ...response };
    newResponse[questionIndex] = answer;
    onChange(newResponse);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Reading Comprehension
      </h3>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {question.data.passage}
        </p>
      </div>

      <div className="space-y-6">
        {question.data.questions?.map((subQuestion, index) => (
          <div key={index} className="border-l-4 border-blue-200 pl-4">
            <h4 className="font-medium text-gray-800 mb-3">
              {index + 1}. {subQuestion.question}
            </h4>

            <div className="space-y-2">
              {subQuestion.options?.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question-${question._id}-${index}`}
                    value={option}
                    checked={(response && response[index]) === option}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComprehensionQuestion;
