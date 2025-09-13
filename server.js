const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
const usersPath = path.join(__dirname, 'users.json');

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

// POST /api/login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  fs.readFile(usersPath, 'utf8', async (err, data) => {
    if (err) {
      return res.status(500).send('Error reading users file');
    }
    const users = JSON.parse(data);
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(400).send('Invalid email or password');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).send('Invalid email or password');
    }

    if (!user.approved) {
      return res.status(401).send('Your account has not been approved by an admin yet.');
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
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

// POST /api/signup
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  fs.readFile(usersPath, 'utf8', async (err, data) => {
    let users = [];
    if (!err) {
      users = JSON.parse(data);
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).send('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      approved: false
    };

    users.push(newUser);
    fs.writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        res.status(500).send('Error saving user');
        return;
      }
      const approvalLink = `http://localhost:${port}/api/admin/approve-user?userId=${newUser.id}`;
      console.log(`\n--- NEW USER SIGNUP ---\nApproval link for ${newUser.name} (${newUser.email}):\n${approvalLink}\n`);
      res.status(201).send('Signup successful. Please wait for admin approval.');
    });
  });
});

// GET /api/admin/approve-user
app.get('/api/admin/approve-user', (req, res) => {
  const { userId } = req.query;
  fs.readFile(usersPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading users file');
    }
    let users = JSON.parse(data);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }

    users[userIndex].approved = true;

    fs.writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error saving user');
      }
      res.send(`<h1>User ${users[userIndex].name} approved successfully!</h1>`);
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
