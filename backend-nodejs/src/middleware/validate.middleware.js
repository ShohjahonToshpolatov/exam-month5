const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validatsiya xatosi",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    if (source === "body") {
      req.body = value;
    } else {
      Object.keys(req[source]).forEach((key) => delete req[source][key]);
      Object.assign(req[source], value);
    }

    next();
  };
};

export { validate };
