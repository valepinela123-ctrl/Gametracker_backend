const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // Esto hace referencia al ID del usuario
        ref: 'User', // Asume que tu modelo de usuario se llama 'User'
        required: true
    },
    game: {
        type: mongoose.Schema.Types.ObjectId, // Esto hace referencia al ID del juego
        ref: 'Game', // Asume que tu modelo de juego se llama 'Game'
        required: true
    },
    text: {
        type: String,
        required: [true, 'El texto de la reseña es obligatorio.'],
        trim: true,
        minlength: [10, 'La reseña debe tener al menos 10 caracteres.']
    },
    rating: {
        type: Number,
        required: [true, 'La puntuación de la reseña es obligatoria.'],
        min: [1, 'La puntuación mínima es 1 estrella.'],
        max: [5, 'La puntuación máxima es 5 estrellas.']
    },
    // `timestamps: true` añade automáticamente `createdAt` y `updatedAt`
}, {
    timestamps: true // Esto es muy útil, añade `createdAt` y `updatedAt` automáticamente
});

// Opcional: Para asegurar que un usuario solo pueda dejar una reseña por juego
reviewSchema.index({ user: 1, game: 1 }, { unique: true, message: 'Ya has dejado una reseña para este juego.' });


module.exports = mongoose.model('Review', reviewSchema);