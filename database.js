const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'islamic_scholar_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
};

// Initialize database and create tables
const initializeDatabase = async () => {
    try {
        // Create database if it doesn't exist
        const tempConnection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        
        await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        await tempConnection.end();
        
        // Create tables
        await createTables();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
};

// Create all necessary tables
const createTables = async () => {
    const tables = [
        // Books table
        `CREATE TABLE IF NOT EXISTS books (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title_english VARCHAR(255) NOT NULL,
            title_arabic VARCHAR(255) NOT NULL,
            cover_image VARCHAR(255),
            pdf_file VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_title_english (title_english),
            INDEX idx_title_arabic (title_arabic)
        )`,
        
        // Contact messages table
        `CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            category ENUM('complaint', 'suggestion', 'appreciation') NOT NULL,
            subject VARCHAR(255),
            message TEXT NOT NULL,
            status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_category (category),
            INDEX idx_created_at (created_at)
        )`,
        
        // Donations table
        `CREATE TABLE IF NOT EXISTS donations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reference VARCHAR(255) UNIQUE NOT NULL,
            donor_name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(20),
            amount DECIMAL(10, 2) NOT NULL,
            status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
            type VARCHAR(50) DEFAULT 'income',
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_reference (reference),
            INDEX idx_status (status),
            INDEX idx_created_at (created_at)
        )`,
        
        // Admin users table
        `CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            role ENUM('admin', 'moderator') DEFAULT 'admin',
            last_login TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_username (username)
        )`,
        
        // Audio files table
        `CREATE TABLE IF NOT EXISTS audio_files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title_english VARCHAR(255) NOT NULL,
            title_arabic VARCHAR(255) NOT NULL,
            description_english TEXT,
            description_arabic TEXT,
            audio_file VARCHAR(255) NOT NULL,
            duration INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_title_english (title_english),
            INDEX idx_title_arabic (title_arabic)
        )`,
        
        // Video files table
        `CREATE TABLE IF NOT EXISTS video_files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title_english VARCHAR(255) NOT NULL,
            title_arabic VARCHAR(255) NOT NULL,
            description_english TEXT,
            description_arabic TEXT,
            video_file VARCHAR(255),
            youtube_url VARCHAR(255),
            thumbnail VARCHAR(255),
            duration INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_title_english (title_english),
            INDEX idx_title_arabic (title_arabic)
        )`
    ];
    
    for (const tableSQL of tables) {
        await pool.execute(tableSQL);
    }
};

// Database query helpers
const executeQuery = async (sql, params = []) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

const executeTransaction = async (queries) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (const { sql, params } of queries) {
            const [result] = await connection.execute(sql, params);
            results.push(result);
        }
        
        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    pool,
    testConnection,
    initializeDatabase,
    createTables,
    executeQuery,
    executeTransaction
};
