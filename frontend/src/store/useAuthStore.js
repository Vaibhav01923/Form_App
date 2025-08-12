import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      set({ authUser: null });
      console.log("error in check auth", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (credentials) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", credentials);
      toast.success("Account created successfully");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in signup", error);
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (credentials) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", credentials);
      toast.success("Logged in successfully");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in login", error);
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      toast.success("Logged out successfully");
      set({ authUser: null });
    } catch (error) {
      console.log("Error in logout", error);
      throw error;
    }
  },
  getForms: async () => {
    try {
      const res = await axiosInstance.get("/forms/get");
      return res.data;
    } catch (error) {
      console.log("Error in getForms", error);
      throw error;
    }
  },
  getFormById: async (formId) => {
    try {
      const res = await axiosInstance.get(`/forms/get/${formId}`);
      return res.data;
    } catch (error) {
      console.log("Error in getFormById", error);
      throw error;
    }
  },
  editForm: async (formId, formData) => {
    try {
      const res = await axiosInstance.put(`/forms/edit/${formId}`, formData);
      toast.success("Form Updated successfully");
      return res.data;
    } catch (error) {
      console.log("Error in editForm", error);
      throw error;
    }
  },
  createForm: async (formData) => {
    try {
      const res = await axiosInstance.post("/forms/create", formData);
      toast.success("Form created successfully");
      return res.data;
    } catch (error) {
      console.log("Error in createForm", error);
      throw error;
    }
  },
  uploadImage: async (imageFile) => {
    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageFile);
      });

      const res = await axiosInstance.post("/forms/upload-image", {
        image: base64,
      });

      return res.data;
    } catch (error) {
      console.log("error in uploadImage", error);
      toast.error(error.response?.data?.message || "Error uploading image");
      throw error;
    }
  },
  getFormResponses: async (formId) => {
    try {
      console.log("Making request to:", `/responses/form/${formId}`);
      const res = await axiosInstance.get(`/responses/form/${formId}`);
      console.log("API response:", res.data);
      return res.data;
    } catch (error) {
      console.log("Error in getFormResponses", error);
      console.log("Error response:", error.response?.data);
      throw error;
    }
  },
}));

export default useAuthStore;
