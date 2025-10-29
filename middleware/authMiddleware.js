const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importa tu modelo de Usuario para buscarlo por ID

const protect = async (req, res, next) => {
    let token;

    // 1. Verificar si el token está presente en el encabezado de autorización
    // El formato esperado es: Authorization: Bearer <TOKEN_JWT>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener el token de la cadena "Bearer <TOKEN_JWT>"
            token = req.headers.authorization.split(' ')[1]; // [0] es "Bearer", [1] es el token

            // 2. Verificar y decodificar el token JWT
            // jwt.verify(token, secret, callback/options)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Buscar al usuario asociado con el ID decodificado del token
            // .select('-password') excluye el campo de contraseña del objeto de usuario retornado
            req.user = await User.findById(decoded.id).select('-password');
            
            // Si no se encuentra el usuario con ese ID (ej. usuario eliminado)
            if (!req.user) {
                return res.status(401).json({ message: 'No autorizado, token fallido (usuario no encontrado).' });
            }

            // Si todo está bien, adjunta el objeto de usuario (sin contraseña) a la petición
            // y llama a `next()` para pasar al siguiente middleware o controlador de ruta
            next();
        } catch (error) {
            console.error('Error de autenticación:', error.message);
            res.status(401).json({ message: 'No autorizado, token no válido o expirado.' });
        }
    }

    // Si no se encuentra un token en el encabezado
    if (!token) {
        res.status(401).json({ message: 'No autorizado, no se proporcionó un token.' });
    }
};

module.exports = { protect }; // Exporta la función protect para usarla en tus rutas