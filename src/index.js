import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

import productRoutes from './routes/product.routes.js';

dotenv.config();

const app = express();

app.use(morgan('dev')); 
app.use(cors());
app.use(express.json()); 
app.use('/api/products', productRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor del Ecommerce funcionando correctamente');
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});