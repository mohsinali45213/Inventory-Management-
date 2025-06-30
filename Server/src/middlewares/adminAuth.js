// admin authentication middleware
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.models.js';

export const authenticateAdmin = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the token is for an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    
    const admin = await Admin.findOne({ where: { id: decoded.id, status: "active" } });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    req.user = admin; // Attach admin to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}; 