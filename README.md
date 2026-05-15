# Dream PC - PC Builder with 2D Visualization

> **⚠️ Note:** This project is no longer actively maintained. Feel free to fork it, use it, or build on top of it!

## Overview

Dream PC is an interactive PC builder tool that allows users to select computer components and visualize them in a 2D PC case representation. It's perfect for PC enthusiasts who want to see how their components fit together before purchasing.

## Features

### ✅ Implemented

- **2600+ PC Components Database** :
  - Full database of specs and product data por products from fans to ssd and gpu's
  - Amazon ASIN for each component
  - Took me 1year to biuld... I hope some people use it !

- **2D Canvas Visualization**: Real-time 2D rendering of PC components inside a case
  - Dynamic component positioning based on case type
  - Support for multiple form factors (ATX, mATX, Mini-ITX, EATX)
  - Image-based component rendering
  - Component scaling and rotation

- **Backend System for the 2D Visualization**:
  - Express.js REST API
  - SQLite database for component data management
  - Component specifications storage
  - CORS support for cross-origin requests
  - Special positioning configuration for case layouts

### ❌ Not Implemented

- The PC builder itself
- The component compatibility checker.=

## Getting Started

### Prerequisites

- Node.js (for the server)
- Python 3 (for the HTTP server)
- SQLite database with component data

### Installation & Setup

1. Navigate to the project folder:
   ```bash
   cd /path/to/DreamPC
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your SQLite database (`components-db.sqlite`) with the required tables:
   - `main` - Main component data (id, value, name, type, category)
   - `visualizer` - Visualization data (value, image, image2, specialPositions)
   - Type-specific tables: `cpu`, `gpu`, `motherboard`, `aio`, `case_`, `aircooler`, `fans`

4. Add component images to the `/images` folder

5. Start the backend server:
   ```bash
   node server.js
   ```
   The server will run on `http://localhost:3000`

6. In a new terminal, start the web server:
   ```bash
   python -m http.server 8000
   ```

7. Open your browser and navigate to `http://localhost:8000`

### Optional: PNG Adjustment Tool

To adjust component images:
```bash
python ./png_adjust.py
```

## Project Structure

```
DreamPC/
├── index.html           # Main HTML template
├── script.js            # Frontend logic and visualization
├── index.css            # Styling
├── server.js            # Express backend API
├── package.json         # Node.js dependencies
├── images/              # Component images (GPU, CPU, motherboard, etc.)
├── special_positions/   # Case layout configuration files (JSON)
└── README.md            # This file
```

## How It Works

1. **User selects components** via checkboxes in the interface
2. **Frontend fetches component data** from the backend API using component IDs
3. **Special positioning data** is loaded from JSON files matching the case type
4. **Canvas visualization** renders components with proper positioning and sizing
5. **User can toggle vertical GPU** mounting for compatible cases

## API Endpoints

### GET `/api/components/:value`

Fetches complete data for a component by its value ID.

**Response Structure:**
```json
{
  "main": { /* component metadata */ },
  "specifications": { /* component specs */ },
  "visualizer": { /* rendering data */ },
  "imageUrl": "/images/...",
  "imageUrl2": "/images/...",
  "specialPositionsUrl": "/special_positions/..."
}
```

### GET `/api/components/:category`

Fetches components by category (may need implementation fixes).

## Contributing

This project is open source! Feel free to:
- Fork and modify the code
- Add new features (compatibility checking, better UI, mobile support)
- Improve database schema
- Submit improvements
- Create variants or custom builders

## License

This project is provided as-is for educational and personal use. Check with original repository for specific license details.

---

**Want to contribute?** Feel free to fork this project and build upon it! The codebase is well-commented and modular, making it a good starting point for learning about PC hardware specifications and web-based visualization.