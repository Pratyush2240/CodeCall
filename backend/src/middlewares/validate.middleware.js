import { ZodError } from "zod";
import AppError from "../utils/appError.js";

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
      const message = err.issues.map(issue => issue.message).join(", ");
      return next(new AppError(message, 400));
    }

    next(err);
  }
};

export default validate;
