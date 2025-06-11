

const  isAdminUser = (req, res, next) => {
    if (req.userInfo.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: `Accès refusé, droits d\'administrateur requis.`,
        })
    }
    next();
}

module.exports = isAdminUser;