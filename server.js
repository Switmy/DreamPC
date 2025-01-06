const express = require('express');
const cors = require('cors');
const { createDatabase } = require('./database');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors()); // Ajout de CORS pour permettre les requêtes cross-origin

const db = createDatabase();

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/api/components/:type/:value', (req, res) => {
    const { type, value } = req.params;

    db.get(`SELECT image, metadata FROM components WHERE type = ? AND value = ?`, [type, value], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (!row) {
            console.warn(`Component not found: type=${type}, value=${value}`);
            res.status(404).json({ error: 'Component not found' });
            return;
        }

        const imagePath = path.join(__dirname, 'images', row.image);

        // Check if the file exists and has a valid image extension
        fs.promises
            .access(imagePath)
            .then(() => {
                const extname = path.extname(imagePath).toLowerCase();
                if (!['.png', '.jpg', '.jpeg', '.gif'].includes(extname)) {
                    console.warn(`Unsupported file format for image: ${imagePath}`);
                    res.status(415).json({ error: 'Unsupported file format' });
                    return;
                }

                const imageUrl = `/images/${row.image}`; // Path for static serving
                const metadata = row.metadata ? JSON.parse(row.metadata) : {};

                res.json({ imageUrl, metadata });
            })
            .catch((fileErr) => {
                console.error('File access error:', fileErr.message);
                res.status(404).json({ error: 'Image not found' });
            });
    });
});

app.listen(3000, () => {
    console.log('Started server on http://localhost:3000');
});
