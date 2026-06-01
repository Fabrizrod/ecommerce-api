import pool from '../config/db.js';
import axios from 'axios';
import Joi from 'joi';

// 1. VALIDACIÓN DE DATOS CON JOI
const productSchema = Joi.object({
    name: Joi.string().max(255).required(),
    description: Joi.string().allow('', null),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required()
});

// 2. GET /api/products - Listar todos
export const getAllProducts = async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

// 3. GET /api/products/:id - Mostrar por ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (products.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(products[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
};

// 4. POST /api/products - Crear producto + API Externa
export const createProduct = async (req, res) => {
    try {
        // Validar datos de entrada
        const { error } = productSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, description, price, stock } = req.body;

        // Consumo de API externa con Axios (DummyJSON) para evitar el bloqueo
        const randomApiId = Math.floor(Math.random() * 100) + 1; // Un ID entre 1 y 100
        const apiRes = await axios.get(`https://dummyjson.com/products/${randomApiId}`);
        const image_url = apiRes.data.images[0]; // Extraemos la primera imagen del array

        // Guardar en MySQL
        const [result] = await pool.query(
            'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
            [name, description, price, stock, image_url]
        );

        res.status(201).json({ 
            message: 'Producto creado exitosamente',
            product: { id: result.insertId, name, description, price, stock, image_url } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el producto y consumir API' });
    }
};

// 5. PUT /api/products/:id - Actualizar
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = productSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { name, description, price, stock } = req.body;
        const [result] = await pool.query(
            'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
            [name, description, price, stock, id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

// 6. DELETE /api/products/:id - Eliminar
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};