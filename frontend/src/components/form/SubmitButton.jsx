import React from "react";
import { Send } from "lucide-react";

const SubmitButton = ({ submitting }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Form
          </>
        )}
      </button>
    </div>
  );
};

export default SubmitButton;
