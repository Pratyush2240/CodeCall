import { executeJavaScript } from "../services/codeExecution.service.js";
import { successResponse } from "../utils/response.js";

export const runCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    const result = await executeJavaScript(code);
    successResponse(res, result);
  } catch (err) {
    next(err);
  }
};
