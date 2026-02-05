import {
  registerUser,
  loginUser
} from "../services/auth.service.js";

/**
 * Register Controller
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login Controller
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const tokens = await loginUser({ email, password });

    res.status(200).json({
      success: true,
      ...tokens
    });
  } catch (err) {
    next(err);
  }
};
