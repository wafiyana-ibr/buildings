/**
 * Middleware to check if the user has admin role
 */
const checkAdminRoleWafi = (req, res, next) => {
  try {
    // User information should be attached by the authentication middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // User is admin, proceed to the next middleware
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking admin privileges'
    });
  }
};
module.exports = checkAdminRoleWafi;