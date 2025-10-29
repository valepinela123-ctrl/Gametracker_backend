const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // ¡Importa tu nuevo middleware!

router.post('/register', registerUser); // POST /api/users/register (no necesita protect)
router.post('/login', loginUser);       // POST /api/users/login (no necesita protect)
router.get('/me', protect, getMe);      // GET /api/users/me (requiere autenticación, usa protect)

module.exports = router;