const Review = require('../models/Review'); // Importa tu modelo de Reseña
const Game = require('../models/Game'); // Importa tu modelo de Juego (lo necesitarás para validaciones)

exports.getYourReviews = async (req, res) => {
    try {
        // req.user.id viene de tu middleware de autenticación (el ID del usuario logueado)
        const reviews = await Review.find({ user: req.user.id })
                                     .populate('game', 'title platform cover_image_url') // Muestra detalles del juego
                                     .sort({ createdAt: -1 }); // Las reseñas más recientes primero

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor al obtener tus reseñas.' });
    }
};

// @desc    Obtener reseñas de un juego específico
// @route   GET /api/reviews/game/:juegoId
// @access  Public (puede ser privado si solo usuarios logueados pueden ver reseñas)
exports.getReviewsByGameId = async (req, res) => {
    try {
        // Validación: Asegurarse de que el juegoId es un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(req.params.juegoId)) {
            return res.status(400).json({ message: 'ID de juego inválido.' });
        }

        const reviews = await Review.find({ game: req.params.juegoId })
                                     .populate('user', 'username') // Muestra el username del autor de la reseña
                                     .sort({ createdAt: -1 });

        // Si no hay reseñas, devuelve un array vacío o un mensaje 404 si prefieres
        if (!reviews || reviews.length === 0) {
            return res.status(200).json([]); // O 404: { message: 'No se encontraron reseñas para este juego.' }
        }

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor al obtener reseñas del juego.' });
    }
};

// @desc    Escribir nueva reseña
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    const { game, text, rating } = req.body; // 'game' debe ser el ID del juego

    // Validaciones básicas de entrada
    if (!game || !text || !rating) {
        return res.status(400).json({ message: 'Por favor, proporciona el ID del juego, el texto y la puntuación de la reseña.' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'La puntuación debe ser entre 1 y 5 estrellas.' });
    }

    try {
        // Opcional: Verificar si el juego existe y pertenece al usuario (si es una reseña de TU juego)
        // const existingGame = await Game.findOne({ _id: game, user: req.user.id });
        // if (!existingGame) {
        //     return res.status(404).json({ message: 'Juego no encontrado en tu biblioteca para reseñar.' });
        // }

        // Si quieres que el usuario solo pueda reseñar una vez un juego
        const existingReview = await Review.findOne({ user: req.user.id, game: game });
        if (existingReview) {
            return res.status(409).json({ message: 'Ya has escrito una reseña para este juego. Puedes editarla si lo deseas.' });
        }

        const newReview = new Review({
            user: req.user.id, // ID del usuario logueado
            game,
            text,
            rating
        });

        const review = await newReview.save();
        res.status(201).json(review); // 201 Created para indicar que el recurso fue creado
    } catch (error) {
        console.error(error);
        // Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Error del servidor al crear la reseña.' });
    }
};

// @desc    Actualizar reseña existente
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
    const { text, rating } = req.body; // No permitimos cambiar 'game' o 'user'
    const reviewId = req.params.id;

    // Validación: Asegurarse de que el ID de la reseña es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: 'ID de reseña inválido.' });
    }

    try {
        let review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Reseña no encontrada.' });
        }

        // Seguridad: Solo el propietario puede actualizar su propia reseña
        if (review.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'No autorizado para actualizar esta reseña.' });
        }

        // Actualizar campos si se proporcionan y son válidos
        if (text) review.text = text;
        if (rating !== undefined) { // Permite actualizar a 0 si tu diseño lo permite, pero aquí validamos 1-5
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'La puntuación debe ser entre 1 y 5 estrellas.' });
            }
            review.rating = rating;
        }
        // `timestamps: true` en el modelo se encargará de `updatedAt`

        const updatedReview = await review.save();
        res.json(updatedReview);
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Error del servidor al actualizar la reseña.' });
    }
};

// @desc    Eliminar reseña
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    const reviewId = req.params.id;

    // Validación: Asegurarse de que el ID de la reseña es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: 'ID de reseña inválido.' });
    }

    try {
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Reseña no encontrada.' });
        }

        // Seguridad: Solo el propietario puede eliminar su propia reseña
        if (review.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'No autorizado para eliminar esta reseña.' });
        }

        await review.deleteOne(); // Usar deleteOne() en Mongoose 6+; .remove() está obsoleto
        res.json({ message: 'Reseña eliminada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor al eliminar la reseña.' });
    }
};