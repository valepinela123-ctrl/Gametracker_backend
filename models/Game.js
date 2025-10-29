const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
    {
        // Campos que esperamos para un juego (puedes añadir o quitar según necesites)
        title: { type: String, required: true },
        genre: { type: String, required: true }, // Opcional
        platform: { type: String, required: false }, // Opcional
        releaseDate: { type: Date, required: false }, // Opcional
        developer: { type: String, required: false }, // Opcional
        publisher: { type: String, required: false }, // Opcional
        coverImage: { type: String, required: false }, // URL de la imagen de portada
        
        // Campos adicionales para la biblioteca personal del usuario
        status: { 
            type: String, 
            enum: ['playing', 'completed', 'plan_to_play', 'dropped'], // Estados posibles del juego
            default: 'plan_to_play' 
        },
        score: { type: Number, min: 1, max: 5, required: false }, // Puntuación de 1 a 5 estrellas
        hoursPlayed: { type: Number, default: 0 } // Horas jugadas
    },
    { collection: 'games', timestamps: true }
);

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;