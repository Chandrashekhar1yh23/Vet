module.exports = function (allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Authorization missing role.' });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
        }
        
        next();
    };
};
