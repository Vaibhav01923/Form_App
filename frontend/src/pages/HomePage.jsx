import { Share2, Copy, Check, Edit3, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormImagePlaceholder from "../components/common/FormImagePlaceholder";
import CreateFormModal from "../components/form/CreateFormModal";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const HomePage = () => {
  const [forms, setForms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedFormId, setCopiedFormId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { getForms } = useAuthStore();
  const navigate = useNavigate();

  // Debug logging
  console.log("HomePage rendering, getForms:", getForms);
  console.log("forms state:", forms);
  console.log("loading state:", loading);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const response = await getForms();
        setForms(response.forms || []);
      } catch (error) {
        console.error("Error Fetching Forms: ", error);
        setForms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, [getForms]);

  const handleFormClick = (form) => {
    navigate(`/forms/${form._id}/edit`);
  };
  const generateShareableLink = (form) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/form/${form._id}`;
  };

  const handleCopyLink = async (form, event) => {
    event.stopPropagation();
    const shareableLink = generateShareableLink(form);

    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopiedFormId(form._id);
      toast.success("Shareable link copied to clipboard!");

      setTimeout(() => {
        setCopiedFormId(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleEditClick = (form, event) => {
    event.stopPropagation(); // Prevent form click
    navigate(`/forms/${form._id}/edit`);
  };
  const handleCreateNewForm = () => {
    setShowCreateModal(true);
  };

  const handleFormCreated = async (newForm) => {
    // Refresh the forms list to show the new form
    const updatedForms = await getForms();
    setForms(updatedForms.forms || []);

    // Navigate to the edit page for the newly created form
    navigate(`/forms/${newForm._id}/edit`);
  };
  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 mt-2">
          <h1 className="text-3xl font-bold text-gray-800">My Forms</h1>
          <button
            onClick={handleCreateNewForm}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Form
          </button>
        </div>
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading forms...</p>
          </div>
        ) : forms && forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div
                key={form._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div
                  className="h-48 bg-gray-200 rounded-t-lg overflow-hidden"
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
                          '<div class="w-full h-full"><div class="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><div class="text-center"><svg class="h-12 w-12 text-blue-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><p class="text-sm text-blue-600 font-medium">Form</p></div></div></div>';
                      }}
                    />
                  ) : (
                    <FormImagePlaceholder className="w-full h-full" />
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-800 truncate">
                      {form.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        form.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>
                      {form.questionsCount} question
                      {form.questionsCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Shareable Link Section */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 mb-1">
                          Shareable Link:
                        </p>
                        <p className="text-sm text-blue-600 truncate font-mono">
                          {generateShareableLink(form)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleCopyLink(form, e)}
                        className={`flex items-center px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                          copiedFormId === form._id
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                      >
                        {copiedFormId === form._id ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Copied!</span>
                            <span className="sm:hidden">✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleEditClick(form, e)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Form
                    </button>
                    <button
                      onClick={(e) => handleCopyLink(form, e)}
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No forms found
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first form to get started
            </p>
            <button
              onClick={handleCreateNewForm}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Form
            </button>
          </div>
        )}

        {/* Create Form Modal */}
        <CreateFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleFormCreated}
        />
      </div>
    </div>
  );
};

export default HomePage;
