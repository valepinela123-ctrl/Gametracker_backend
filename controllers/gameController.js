const Game = require('../models/Game'); // Importa el modelo de Juego

// Obtener todos los juegos
exports.getAllGames = async (req, res) => {
    try {
        const games = await Game.find();
        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un juego por ID
exports.getGameById = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Juego no encontrado' });
        }
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo juego
exports.createGame = async (req, res) => {
    // Asumimos que el body de la petición tendrá los datos del juego.
    const newGameData = req.body;
    
    try {
        const newGame = await Game.create(newGameData); // 'create' con los datos del body
        res.status(201).json(newGame); // 201 Created
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 Bad Request por datos inválidos
    }
};

// Actualizar un juego
exports.updateGame = async (req, res) => {
    try {
        const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedGame) {
            return res.status(404).json({ message: 'Juego no encontrado para actualizar' });
        }
        res.status(200).json(updatedGame);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar un juego
exports.deleteGame = async (req, res) => {
    try {
        const deletedGame = await Game.findByIdAndDelete(req.params.id);
        if (!deletedGame) {
            return res.status(404).json({ message: 'Juego no encontrado para eliminar' });
        }
        res.status(200).json({ message: 'Juego eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};