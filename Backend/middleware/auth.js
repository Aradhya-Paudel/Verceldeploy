const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-prod';

/**
 * Middleware to verify JWT token
 */
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
       return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
};

/**
 * Middleware to restrict access by role
 * @param {string[]} roles - Allowed roles e.g. ['admin', 'hospital']
 */
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: "Access denied. Insufficient permissions.", 
        requiredRole: roles,
        currentRole: req.user.role 
      });
    }

    next();
  };
};

/**
 * Middleware to verify entity ownership
 * User must be admin OR belong to the entity being accessed
 * @param {string} paramName - Name of the route param containing entity ID (e.g., 'id')
 */
exports.verifyEntityOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    // Admins can access everything
    if (req.user.role === 'admin' || req.user.role === 'dispatcher') {
      return next();
    }

    const requestedId = parseInt(req.params[paramName]);
    const userEntityId = req.user.entityId;

    if (!userEntityId || userEntityId !== requestedId) {
      return res.status(403).json({ 
        error: "Access denied. You can only modify your own resources." 
      });
    }

    next();
  };
};
