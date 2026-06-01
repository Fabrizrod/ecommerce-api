import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión exitosa a la base de datos MySQL en AIVEN');
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                stock INT NOT NULL,
                image_url VARCHAR(500)
            );
        `);
        console.log('Tabla "products" verificada/creada correctamente en la nube');
        
        connection.release();
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
    }
})();

export default pool;