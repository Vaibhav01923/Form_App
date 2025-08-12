import React from "react";

const ResultsView = ({ question, userAnswer }) => {
  if (!userAnswer) {
    return <div className="text-gray-500 italic">No answer provided</div>;
  }

  // Helper function to check if categorize answer is correct
  const isCategorizeCorrect = (item, userCategory) => {
    return item.category === userCategory;
  };

  // Helper function to check if cloze answer is correct (case-insensitive)
  const isClozeCorrect = (correctAnswer, userAnswer) => {
    if (!correctAnswer || !userAnswer) return false;
    return (
      correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim()
    );
  };

  // Helper function to check if comprehension answer is correct
  const isComprehensionCorrect = (correctAnswer, userAnswer) => {
    if (!correctAnswer || !userAnswer) return false;
    return correctAnswer === userAnswer;
  };

  return (
    <div>
      {question.type === "categorize" && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {question.data.question}
          </h3>
          <div className="space-y-2">
            {question.data.items?.map((item, index) => {
              const userCategory = userAnswer[index];
              const isCorrect =
                userCategory && isCategorizeCorrect(item, userCategory);

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    !userCategory
                      ? "bg-gray-50 border-gray-200"
                      : isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <span className="font-medium text-gray-700">{item.text}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        !userCategory
                          ? "bg-gray-100 text-gray-600"
                          : isCorrect
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {userCategory || "Not categorized"}
                    </span>
                    {userCategory && (
                      <span
                        className={`text-sm font-medium ${
                          isCorrect ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCorrect
                          ? "✓ Correct"
                          : `✗ Wrong (should be: ${item.category})`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {question.type === "cloze" && (
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
            <h4 className="font-medium text-gray-700">Your Answers:</h4>
            {question.data.blanks?.map((blankData, index) => {
              const userAnswerText = userAnswer[index];
              const isCorrect =
                userAnswerText &&
                isClozeCorrect(blankData.answer, userAnswerText);

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    !userAnswerText
                      ? "bg-gray-50 border-gray-200"
                      : isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <span className="text-sm font-medium text-gray-600 w-20">
                    Blank {index + 1}:
                  </span>
                  <span
                    className={`px-3 py-1 rounded ${
                      !userAnswerText
                        ? "bg-gray-100 text-gray-600"
                        : isCorrect
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {userAnswerText || "No answer"}
                  </span>
                  {userAnswerText && (
                    <span
                      className={`text-sm font-medium ${
                        isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isCorrect
                        ? "✓ Correct"
                        : `✗ Wrong (correct: ${blankData.answer})`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {question.type === "comprehension" && (
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
            <h4 className="font-medium text-gray-700">Your Answers:</h4>
            {question.data.questions?.map((subQuestion, index) => {
              const userSelectedAnswer = userAnswer[index];
              const correctAnswer = subQuestion.correctAnswer;
              const isCorrect =
                correctAnswer &&
                isComprehensionCorrect(correctAnswer, userSelectedAnswer);

              return (
                <div
                  key={index}
                  className={`border-l-4 pl-4 p-4 rounded-r-lg ${
                    !userSelectedAnswer
                      ? "border-gray-200 bg-gray-50"
                      : isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-medium text-gray-800">
                      {index + 1}. {subQuestion.question}
                    </h5>
                    {!correctAnswer ? (
                      <span className="text-sm font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                        No correct answer set
                      </span>
                    ) : userSelectedAnswer ? (
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          isCorrect
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isCorrect ? "✓ Correct" : "✗ Wrong"}
                      </span>
                    ) : (
                      <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">
                        No answer
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {subQuestion.options?.map((option, optionIndex) => {
                      const isUserSelected = userSelectedAnswer === option;
                      const isCorrectOption =
                        correctAnswer && correctAnswer === option;

                      return (
                        <div
                          key={optionIndex}
                          className={`flex items-center gap-3 p-2 rounded border ${
                            isCorrectOption && isUserSelected
                              ? "bg-green-100 border-green-300" // User selected correct answer
                              : isCorrectOption && !isUserSelected
                              ? "bg-green-50 border-green-200" // Correct answer not selected
                              : isUserSelected && !isCorrectOption
                              ? "bg-red-100 border-red-300" // User selected wrong answer
                              : "bg-gray-50 border-gray-200" // Other options
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isUserSelected
                                ? isCorrectOption
                                  ? "border-green-500 bg-green-500"
                                  : "border-red-500 bg-red-500"
                                : isCorrectOption
                                ? "border-green-400 bg-green-100"
                                : "border-gray-300"
                            }`}
                          >
                            {isUserSelected && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                            {!isUserSelected && isCorrectOption && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </span>
                          <span
                            className={`flex-1 ${
                              isCorrectOption ? "font-medium" : ""
                            }`}
                          >
                            {option}
                          </span>
                          {isCorrectOption && (
                            <span className="text-xs text-green-600 font-medium">
                              Correct Answer
                            </span>
                          )}
                          {isUserSelected &&
                            !isCorrectOption &&
                            correctAnswer && (
                              <span className="text-xs text-red-600 font-medium">
                                Your Choice
                              </span>
                            )}
                          {isUserSelected && !correctAnswer && (
                            <span className="text-xs text-blue-600 font-medium">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Warning if no correct answers are set */}
            {question.data.questions?.some((q) => !q.correctAnswer) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Some questions don't have correct answers configured, so
                  grading may not be accurate.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsView;
