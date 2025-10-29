const jwt = require('jsonwebtoken'); // Para crear los tokens JWT
const bcrypt = require('bcryptjs'); // Para comparar contraseñas
const User = require('../models/User'); // Importa tu modelo de Usuario

// Función auxiliar para generar un token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // El token será válido por 30 días
    });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/users/register
// @access  Public (no requiere token previo)
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Validar que se hayan proporcionado todos los campos
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Por favor, rellena todos los campos.' });
    }

    try {
        // Verificar si ya existe un usuario con el mismo email o username
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'El nombre de usuario o el email ya están en uso.' });
        }

        // Crear el usuario (el hasheo de la contraseña ocurre en el 'pre-save' hook del modelo User)
        const user = await User.create({
            username,
            email,
            password,
        });

        if (user) {
            // Si el usuario se crea correctamente, responder con sus datos y un token JWT
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id), // Generar token para el nuevo usuario
            });
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos.' });
        }
    } catch (error) {
        console.error(error);
        // Manejo de errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Error del servidor al registrar el usuario.' });
    }
};

// @desc    Autenticar un usuario (Iniciar sesión)
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Validar que se hayan proporcionado email y contraseña
    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, introduce tu email y contraseña.' });
    }

    try {
        // Buscar al usuario por su email
        const user = await User.findOne({ email });

        // Si el usuario existe y la contraseña es correcta (usando el método matchPassword del modelo)
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id), // Generar un nuevo token para la sesión
            });
        } else {
            res.status(400).json({ message: 'Credenciales inválidas (email o contraseña incorrectos).' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor al iniciar sesión.' });
    }
};

// @desc    Obtener datos del usuario actual (el que está logueado)
// @route   GET /api/users/me
// @access  Private (requiere autenticación con token)
exports.getMe = async (req, res) => {
    // req.user ya ha sido adjuntado por el middleware 'protect'
    res.status(200).json({
        _id: req.user.id,
        username: req.user.username,
        email: req.user.email
    });
};