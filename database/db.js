const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('MongoDB is connected successfully');
    } catch (err)  {
        console.log('❌ MongoDB connexion failed:', err.message);
        process.exit(1);
    }
}

module.exports = connectDB;