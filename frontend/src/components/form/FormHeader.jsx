import React from "react";
import FormImagePlaceholder from "../common/FormImagePlaceholder";

const FormHeader = ({ form }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100"
          style={{ contain: "layout size" }}
        >
          {form.imageUrl ? (
            <img
              src={form.imageUrl}
              alt={form.title}
              className="w-full h-full object-cover transition-all duration-300"
              style={{ maxHeight: "100%", maxWidth: "100%" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML =
                  '<div class="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><svg class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>';
              }}
            />
          ) : (
            <FormImagePlaceholder className="w-full h-full" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{form.title}</h1>
          <p className="text-gray-600">
            {form.questions.length} question
            {form.questions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormHeader;
