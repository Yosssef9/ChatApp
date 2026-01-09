import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 دقيقة
  max: 5, // الحد الأقصى للطلبات
  handler: (req, res) => {
    res.status(429).json({
      message:
        "Too many attempts from this IP, please try again after a minute.",
    });
  },
});

export default loginLimiter;
