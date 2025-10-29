const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Necesario para hashear y comparar contraseñas

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'El nombre de usuario es obligatorio.'],
            unique: true, // Cada nombre de usuario debe ser único
            trim: true,
            minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres.']
        },
        email: {
            type: String,
            required: [true, 'El correo electrónico es obligatorio.'],
            unique: true, // Cada correo debe ser único
            trim: true,
            match: [/.+@.+\..+/, 'Por favor, introduce un correo electrónico válido'] // Validación de formato de email
        },
        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria.'],
            minlength: [6, 'La contraseña debe tener al menos 6 caracteres.']
        },
    },
    {
        timestamps: true, // Añade automáticamente `createdAt` y `updatedAt`
    }
);

// Middleware de Mongoose: Hashear la contraseña antes de guardarla
// 'pre' significa que se ejecuta ANTES de que el documento se guarde ('save')
userSchema.pre('save', async function (next) {
    // Solo hashear la contraseña si ha sido modificada (o es nueva)
    if (!this.isModified('password')) {
        next(); // Si no se modificó, pasa al siguiente middleware
    }

    // Generar un salt (cadena aleatoria) para el hasheo
    const salt = await bcrypt.genSalt(10); // 10 es el costo del hasheo (más alto = más seguro, más lento)
    // Hashear la contraseña con el salt
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Pasar al siguiente middleware
});

// Método personalizado para comparar contraseñas (útil en el login)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); // Compara la contraseña ingresada con la hasheada en DB
};

module.exports = mongoose.model('User', userSchema);