const roleMiddleware = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Sizda bu amalni bajarish huquqi yo'q",
      });
    }
    next();
  };
};
export { roleMiddleware };
