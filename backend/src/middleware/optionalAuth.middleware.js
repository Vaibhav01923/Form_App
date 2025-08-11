import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      // No token, continue without user
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      req.user = null;
      return next();
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in optional auth middleware:", error.message);
    req.user = null;
    next();
  }
};

export default optionalAuth;
