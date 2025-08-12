import React from "react";

const CategorizeQuestion = ({ question, response = {}, onChange }) => {
  const handleItemCategorize = (itemIndex, category) => {
    const newResponse = { ...response };
    newResponse[itemIndex] = category;
    onChange(newResponse);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {question.data.question}
      </h3>

      <div className="space-y-4">
        {question.data.items?.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
          >
            <span className="font-medium text-gray-700 flex-1">
              {item.text}
            </span>
            <select
              value={(response && response[index]) || ""}
              onChange={(e) => handleItemCategorize(index, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category...</option>
              {question.data.categories?.map((category, catIndex) => (
                <option key={catIndex} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorizeQuestion;
