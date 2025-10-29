const express = require('express');
const router = express.Router();
const {
    getYourReviews,
    getReviewsByGameId,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware'); // ¡Importa tu middleware de autenticación existente!

// Rutas que afectan a la colección de reseñas en general (obtener todas, crear una)
// Ambas requieren autenticación (protect)
router.route('/')
    .get(protect, getYourReviews) // GET /api/reviews - Obtener todas tus reseñas
    .post(protect, createReview); // POST /api/reviews - Escribir nueva reseña

// Ruta para obtener reseñas de un juego específico.
// Nota: Puedes decidir si esta ruta es pública o privada.
// Aquí la dejo pública para que cualquiera pueda ver las reseñas de un juego.
// Si quieres que sea privada, añade `protect` como primer argumento:
// router.get('/game/:juegoId', protect, getReviewsByGameId);
router.get('/game/:juegoId', getReviewsByGameId); // GET /api/reviews/game/:juegoId

// Rutas que afectan a una reseña específica por su ID
// Ambas requieren autenticación (protect) y que seas el dueño de la reseña
router.route('/:id')
    .put(protect, updateReview)    // PUT /api/reviews/:id - Actualizar reseña existente
    .delete(protect, deleteReview); // DELETE /api/reviews/:id - Eliminar reseña

module.exports = router;