require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth-routes');
const homeRoutes = require('./routes/home-routes');
const adminRoutes = require('./routes/admin-routes');
// const uploadImageRoutes = require('./routes/image-routes');
// const deleteImageRoutes = require('./routes/image-routes');
const imageRoutes = require('./routes/image-routes'); // Une seule importation pour image-routes

const connectDB = require('./database/db');
const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à la BDD
connectDB();

// Midlewares
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/image/:id', imageRoutes);


app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
})