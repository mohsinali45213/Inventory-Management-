// authentication middleware
import jwt from 'jsonwebtoken';
import { errorMessage } from '../constants/errorMessages.js';
import { User } from '../models/users.models.js';

export const authenticate = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: errorMessage.UNAUTHORIZED });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.id, status: true } });

    if (!user) {
      return res.status(404).json({ message: errorMessage.USER_NOT_FOUND });
    }

    req.user = user; // Attach user to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: errorMessage.INVALID_TOKEN });
  }
};
