import jwt from "jsonwebtoken";

// Verificar validez dek Token JWT
export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const tokenHeader = authHeader && authHeader.split(' ')[1];

    const token = tokenHeader || req.cookies?.token;  

    if (!token) {
        return res.status(401).json({ mensaje: 'ACCESO DENEGADO: Token no proporcionado.'});
    }
    try {
        const verificar = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificar;
        next();
    } catch (error) {
        return res.status(403).json({ mensaje: 'TOKEN INVALIDO'});
    }
};

//Control de Acceso basado en Roles (RBAC)
export const permitirRoles = ( ...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                mensaje: 'ACCESO DENEGADO: Permisos insuficientes.'
            });
        }
        next();
    };
};