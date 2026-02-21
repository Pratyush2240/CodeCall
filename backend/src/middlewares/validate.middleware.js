import { ZodError } from "zod";
import AppError from "../utils/appError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    next();

  } catch (err) {
    if (err instanceof ZodError) {
      // Collect readable validation messages
      const message = err.issues
        .map((issue) => issue.message)
        .join(", ");

      return next(
        new AppError(
          message,
          400,
          ERROR_CODES.VALIDATION_ERROR
        )
      );
    }

    // Unknown error → bubble to global handler
    next(err);
  }
};

export default validate;