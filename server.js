const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Set up session
app.use(session({
  secret: 'islamic-scholar-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours session expiration
  }
}));

// Middleware to prevent caching of sensitive pages
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "mysql-shamsu557.alwaysdata.net",
  user: process.env.DB_USER || "shamsu557",
  password: process.env.DB_PASSWORD || "@Shamsu1440",
  database: process.env.DB_NAME || "shamsu557_maula_database"
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");
  
  // Create tables if they don't exist
  createTables();
});

// Create database tables
function createTables() {
  const tables = [
    // Books Table
    `CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title_english VARCHAR(255) NOT NULL,
      title_arabic VARCHAR(255),
      cover_image VARCHAR(255),
      pdf_file VARCHAR(255),
      file_size BIGINT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    // Audio Table
    `CREATE TABLE IF NOT EXISTS audio (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title_english VARCHAR(255) NOT NULL,
      title_arabic VARCHAR(255),
      description_english TEXT,
      description_arabic TEXT,
      audio_file VARCHAR(255),
      duration INT DEFAULT 0,
      file_size BIGINT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    // Videos Table
    `CREATE TABLE IF NOT EXISTS videos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title_english VARCHAR(255) NOT NULL,
      title_arabic VARCHAR(255),
      description_english TEXT,
      description_arabic TEXT,
      video_url VARCHAR(500),
      thumbnail VARCHAR(255),
      duration INT DEFAULT 0,
      views INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    // Admins Table
    `CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20),
      role ENUM('superadmin', 'admin') DEFAULT 'admin',
      first_login BOOLEAN DEFAULT TRUE,
      is_active BOOLEAN DEFAULT TRUE,
      last_login TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    // Donations Table
    `CREATE TABLE IF NOT EXISTS donations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      donor_name VARCHAR(255) NOT NULL,
      donor_email VARCHAR(255),
      donor_phone VARCHAR(20),
      amount DECIMAL(12,2) NOT NULL,
      reference VARCHAR(255) NOT NULL UNIQUE,
      status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
      payment_method VARCHAR(50),
      transaction_id VARCHAR(255),
      date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      type VARCHAR(50) DEFAULT 'income',
      description VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Messages Table
    `CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      category ENUM('complaint', 'suggestion', 'appreciation') NOT NULL,
      subject VARCHAR(255),
      message TEXT NOT NULL,
      status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  ];

  tables.forEach((table, index) => {
    db.query(table, (err) => {
      if (err) {
        console.error(`Error creating table ${index + 1}:`, err);
      } else {
        console.log(`✅ Table ${index + 1} created or already exists`);
      }
    });
  });

  // Create default admin after tables are created
  setTimeout(() => {
    createDefaultAdmin();
  }, 1000);
}

// Create default admin
function createDefaultAdmin() {
  // Check if admin already exists
  db.query('SELECT * FROM admins WHERE username = ?', ['admin'], (err, results) => {
    if (err) {
      console.error('Error checking for admin:', err);
      return;
    }

    if (results.length === 0) {
      // Create default admin with username: admin, password: admin
      const hashedPassword = bcrypt.hashSync('admin', 10);
      
      db.query(
        'INSERT INTO admins (username, password, role, first_login) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'superadmin', false],
        (err, result) => {
          if (err) {
            console.error('Error creating default admin:', err);
          } else {
            console.log('✅ Default admin created (username: admin, password: admin)');
          }
        }
      );
    } else {
      console.log('✅ Admin already exists');
    }
  });
}

// Create uploads directories if they don't exist
const createDirectories = async () => {
  const dirs = ['uploads', 'uploads/covers', 'uploads/pdfs', 'uploads/audio'];
  for (const dir of dirs) {
    try {
      await fs.promises.access(dir);
    } catch {
      await fs.promises.mkdir(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  }
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'cover_image') {
      cb(null, 'uploads/covers/');
    } else if (file.fieldname === 'pdf_file') {
      cb(null, 'uploads/pdfs/');
    } else if (file.fieldname === 'audio_file') {
      cb(null, 'uploads/audio/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'cover_image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for cover image'));
      }
    } else if (file.fieldname === 'pdf_file') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'));
      }
    } else if (file.fieldname === 'audio_file') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed'));
      }
    } else {
      cb(new Error('Unexpected field'));
    }
  }
});

// Middleware to check if the user is authenticated as admin
function isAdminAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    return next(); // User is authenticated, proceed to the dashboard
  } else {
    return res.redirect('/admin-login.html'); // Redirect to admin login if not authenticated
  }
}

// Routes

// Serve index.html at the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Audio page
app.get('/audio.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'audio.html'));
});

// Videos page
app.get('/videos.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'videos.html'));
});

// Admin login page
app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

// Admin Dashboard Route (protected for admin users)
app.get('/admin-dashboard.html', isAdminAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// Handle admin login
app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  
  db.query('SELECT * FROM admins WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Error querying database for admin login:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const admin = results[0];
    
    if (bcrypt.compareSync(password, admin.password)) {
      req.session.isAuthenticated = true;
      req.session.admin = {
        id: admin.id,
        username: admin.username,
        role: admin.role
      };
      
      // Update last login
      db.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);
      
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(400).json({ error: 'Invalid credentials' });
    }
  });
});

// Admin logout route
app.get('/admin-logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Server error');
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.redirect('/'); // Redirect to homepage after logout
  });
});

// API Routes

// Get all books
app.get('/api/books', (req, res) => {
  db.query('SELECT * FROM books ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching books:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get all audio
app.get('/api/audio', (req, res) => {
  db.query('SELECT * FROM audio ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching audio:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get all videos
app.get('/api/videos', (req, res) => {
  db.query('SELECT * FROM videos ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching videos:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Add new book
app.post('/api/books', isAdminAuthenticated, upload.fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'pdf_file', maxCount: 1 }
]), (req, res) => {
  const { title_english, title_arabic } = req.body;
  const cover_image = req.files['cover_image'] ? req.files['cover_image'][0].filename : null;
  const pdf_file = req.files['pdf_file'] ? req.files['pdf_file'][0].filename : null;

  if (!pdf_file) {
    return res.status(400).json({ error: 'PDF file is required' });
  }

  db.query(
    'INSERT INTO books (title_english, title_arabic, cover_image, pdf_file) VALUES (?, ?, ?, ?)',
    [title_english, title_arabic, cover_image, pdf_file],
    (err, result) => {
      if (err) {
        console.error('Error adding book:', err);
        return res.status(500).json({ error: 'Failed to add book' });
      }
      
      res.json({ 
        success: true,
        message: 'Book added successfully',
        id: result.insertId
      });
    }
  );
});

// Add new audio
app.post('/api/audio', isAdminAuthenticated, upload.single('audio_file'), (req, res) => {
  const { title_english, title_arabic, description_english, description_arabic } = req.body;
  const audio_file = req.file ? req.file.filename : null;

  if (!audio_file) {
    return res.status(400).json({ error: 'Audio file is required' });
  }

  db.query(
    'INSERT INTO audio (title_english, title_arabic, description_english, description_arabic, audio_file) VALUES (?, ?, ?, ?, ?)',
    [title_english, title_arabic, description_english, description_arabic, audio_file],
    (err, result) => {
      if (err) {
        console.error('Error adding audio:', err);
        return res.status(500).json({ error: 'Failed to add audio' });
      }
      
      res.json({ 
        success: true,
        message: 'Audio added successfully',
        id: result.insertId
      });
    }
  );
});

// Add new video
app.post('/api/videos', isAdminAuthenticated, (req, res) => {
  const { title_english, title_arabic, description_english, description_arabic, video_url } = req.body;

  if (!video_url) {
    return res.status(400).json({ error: 'Video URL is required' });
  }

  db.query(
    'INSERT INTO videos (title_english, title_arabic, description_english, description_arabic, video_url) VALUES (?, ?, ?, ?, ?)',
    [title_english, title_arabic, description_english, description_arabic, video_url],
    (err, result) => {
      if (err) {
        console.error('Error adding video:', err);
        return res.status(500).json({ error: 'Failed to add video' });
      }
      
      res.json({ 
        success: true,
        message: 'Video added successfully',
        id: result.insertId
      });
    }
  );
});

// Delete book
app.delete('/api/books/:id', isAdminAuthenticated, (req, res) => {
  const { id } = req.params;
  
  // Get book data to delete files
  db.query('SELECT * FROM books WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching book:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = results[0];

    // Delete files
    if (book.cover_image) {
      try {
        fs.unlinkSync(`uploads/covers/${book.cover_image}`);
      } catch (err) {
        console.log('Cover image file not found or already deleted');
      }
    }
    
    if (book.pdf_file) {
      try {
        fs.unlinkSync(`uploads/pdfs/${book.pdf_file}`);
      } catch (err) {
        console.log('PDF file not found or already deleted');
      }
    }

    // Delete from database
    db.query('DELETE FROM books WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Error deleting book:', err);
        return res.status(500).json({ error: 'Failed to delete book' });
      }
      
      res.json({ success: true, message: 'Book deleted successfully' });
    });
  });
});

// Delete audio
app.delete('/api/audio/:id', isAdminAuthenticated, (req, res) => {
  const { id } = req.params;
  
  // Get audio data to delete files
  db.query('SELECT * FROM audio WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching audio:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    const audio = results[0];

    // Delete file
    if (audio.audio_file) {
      try {
        fs.unlinkSync(`uploads/audio/${audio.audio_file}`);
      } catch (err) {
        console.log('Audio file not found or already deleted');
      }
    }

    // Delete from database
    db.query('DELETE FROM audio WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Error deleting audio:', err);
        return res.status(500).json({ error: 'Failed to delete audio' });
      }
      
      res.json({ success: true, message: 'Audio deleted successfully' });
    });
  });
});

// Delete video
app.delete('/api/videos/:id', isAdminAuthenticated, (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM videos WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting video:', err);
      return res.status(500).json({ error: 'Failed to delete video' });
    }
    
    res.json({ success: true, message: 'Video deleted successfully' });
  });
});

// Submit contact form
app.post('/api/contact', (req, res) => {
  const { name, email, phone, category, subject, message } = req.body;
  
  if (!name || !email || !category || !message) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  db.query(
    'INSERT INTO messages (name, email, phone, category, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone, category, subject, message],
    (err) => {
      if (err) {
        console.error('Error saving contact message:', err);
        return res.status(500).json({ error: 'Failed to send message' });
      }

      res.json({ success: true, message: 'Message sent successfully' });
    }
  );
});

// Get contact messages
app.get('/api/messages', isAdminAuthenticated, (req, res) => {
  db.query('SELECT * FROM messages ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
    res.json(results);
  });
});

// Paystack donation endpoint
app.post('/api/donations', (req, res) => {
  const {
    donor_name,
    donor_email,
    donor_phone,
    amount,
    reference,
    status,
    payment_method,
    transaction_id,
    type,
    description
  } = req.body;

  if (!donor_name || !amount || !reference) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  db.query(
    'INSERT INTO donations (donor_name, donor_email, donor_phone, amount, reference, status, payment_method, transaction_id, type, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [donor_name, donor_email, donor_phone, amount, reference, status || 'success', payment_method, transaction_id, type || 'income', description || 'Donation received'],
    (err, result) => {
      if (err) {
        console.error('Error saving donation:', err);
        return res.status(500).json({ error: 'Failed to process donation' });
      }

      res.json({ 
        success: true, 
        message: 'Donation processed successfully',
        id: result.insertId
      });
    }
  );
});

// Get donations
app.get('/api/donations', isAdminAuthenticated, (req, res) => {
  db.query('SELECT * FROM donations ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching donations:', err);
      return res.status(500).json({ error: 'Failed to fetch donations' });
    }
    res.json(results);
  });
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  await createDirectories();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Admin login: http://localhost:${PORT}/admin-login.html`);
    console.log(`👤 Default admin credentials: username=admin, password=admin`);
  });
};

startServer().catch(console.error);
