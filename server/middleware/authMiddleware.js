import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // store user data from token
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};
