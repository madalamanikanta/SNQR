# SNQR Full-Stack Application

This is a full-stack web application for SNQR, converted from a static site. It includes a Node.js backend to serve dynamic content and handle form submissions.

## Setup and Installation

### Prerequisites

- Node.js and npm (or yarn) installed on your system.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/madalamanikanta/SNQR.git
   cd SNQR
   ```

2. **Install dependencies:**

   **Using npm:**

   It is recommended to use `sudo` for the installation to avoid potential permission issues.

   ```bash
   sudo npm install
   ```

   **Using yarn:**

   ```bash
   yarn install
   ```

### Running the Application

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **Open the application in your browser:**
   - The main application is available at `http://localhost:3000/home.html`.
   - The admin panel is available at `http://localhost:3000/admin.html`. The password is `admin`.

## Backend API

The backend server provides the following API endpoints:

- `GET /api/publications`: Returns all publications from `research/data/publications.json`.
- `GET /api/publications/:id`: Returns a single publication by ID.
- `GET /api/categories`: Returns all categories from `research/data/categories.json`.
- `GET /api/search?q=<query>`: Searches publications by title, deck, division, or category.
- `POST /api/contact`: Saves a new contact message to `contact_messages.json`.
- `GET /api/contact-messages`: Returns all contact messages.
- `POST /api/admin/publications`: Updates `research/data/publications.json`.
- `POST /api/admin/categories`: Updates `research/data/categories.json`.
