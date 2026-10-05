import { deleteFiles } from "../helpers/deleteFiles.js";
const validate = (schema, source = "body") => {
  return async (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      await deleteFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Validatsiya xatosi",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }
    Object.defineProperty(req, source, { value, writable: true, configurable: true });
    next();
  };
};
export { validate };
