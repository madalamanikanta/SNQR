const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

const config = require('./config.json');
const JWT_SECRET = config.jwt_secret;
const ADMIN_PASSWORD = config.admin_password;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const publicationsPath = path.join(__dirname, 'research', 'data', 'publications.json');
const categoriesPath = path.join(__dirname, 'research', 'data', 'categories.json');
const contactMessagesPath = path.join(__dirname, 'contact_messages.json');

// Middleware to protect admin routes
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send('Access denied');
  }
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ user: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid password');
  }
});

// GET /api/publications
app.get('/api/publications', (req, res) => {
  fs.readFile(publicationsPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading publications file');
      return;
    }
    res.send(JSON.parse(data));
  });
});

// GET /api/publications/:id
app.get('/api/publications/:id', (req, res) => {
  fs.readFile(publicationsPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading publications file');
      return;
    }
    const publications = JSON.parse(data).publications;
    const publication = publications.find(p => p.id === req.params.id);
    if (publication) {
      res.send(publication);
    } else {
      res.status(404).send('Publication not found');
    }
  });
});

// GET /api/categories
app.get('/api/categories', (req, res) => {
  fs.readFile(categoriesPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading categories file');
      return;
    }
    res.send(JSON.parse(data));
  });
});

// GET /api/search
app.get('/api/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  fs.readFile(publicationsPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading publications file');
      return;
    }
    const publications = JSON.parse(data).publications;
    const results = publications.filter(p =>
      (p.title || '').toLowerCase().includes(query) ||
      (p.deck || '').toLowerCase().includes(query) ||
      (p.division || '').toLowerCase().includes(query) ||
      (p.cat || '').toLowerCase().includes(query)
    );
    res.send(results);
  });
});

// POST /api/contact
app.post('/api/contact', (req, res) => {
  const newMessage = req.body;
  fs.readFile(contactMessagesPath, 'utf8', (err, data) => {
    let messages = [];
    if (!err) {
      messages = JSON.parse(data);
    }
    messages.push(newMessage);
    fs.writeFile(contactMessagesPath, JSON.stringify(messages, null, 2), (err) => {
      if (err) {
        res.status(500).send('Error saving contact message');
        return;
      }
      res.status(201).send('Contact message saved');
    });
  });
});

// GET /api/contact-messages
app.get('/api/contact-messages', authenticateAdmin, (req, res) => {
  fs.readFile(contactMessagesPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading contact messages file');
      return;
    }
    res.send(JSON.parse(data));
  });
});

// POST /api/admin/publications
app.post('/api/admin/publications', authenticateAdmin, (req, res) => {
  const { content } = req.body;
  try {
    JSON.parse(content);
  } catch (e) {
    res.status(400).send('Invalid JSON format');
    return;
  }
  fs.writeFile(publicationsPath, content, (err) => {
    if (err) {
      res.status(500).send('Error saving publications.json');
      return;
    }
    res.status(200).send('publications.json saved');
  });
});

// POST /api/admin/categories
app.post('/api/admin/categories', authenticateAdmin, (req, res) => {
  const { content } = req.body;
  try {
    JSON.parse(content);
  } catch (e) {
    res.status(400).send('Invalid JSON format');
    return;
  }
  fs.writeFile(categoriesPath, content, (err) => {
    if (err) {
      res.status(500).send('Error saving categories.json');
      return;
    }
    res.status(200).send('categories.json saved');
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
