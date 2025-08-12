import React from "react";
import { FileText } from "lucide-react";

const FormImagePlaceholder = ({ className = "" }) => {
  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${className}`}
    >
      <FileText className="h-6 w-6 text-blue-400" />
    </div>
  );
};

export default FormImagePlaceholder;
