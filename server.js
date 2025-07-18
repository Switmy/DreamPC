const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./components-db.sqlite');

const app = express();
app.use(cors()); // Cors for cross-origin requests

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/special_positions', express.static(path.join(__dirname, 'special_positions')));

app.get('/api/components/:type/:value', (req, res) => {
    const { type, value } = req.params;

    // Validate inputs (basic example, consider stricter validation based on your requirements)
    if (!type || !value) {
        res.status(400).json({ error: 'type and value are not validated' });
        return;
    }

    // Get the component data dynamically
    db.get(
        `SELECT * FROM components WHERE type = ? AND value = ?`,
        [type, value],
        async (err, row) => {
            if (err) {
                console.error(`Database error for type=${type} and value=${value}:`, err.message);
                res.status(500).json({ error: 'Database error occurred' });
                return;
            }
    
            if (!row) {
                console.warn(`Component not found for type=${type} and value=${value}`);
                res.status(404).json({ error: `Component not found for type=${type} and value=${value}` });
                return;
            }
    
            const imagePath = path.join(__dirname, 'images', row.image);
            const specialPositionsPath = path.join(__dirname, 'special_positions', row.specialPositions || '');
    
            try {
                await fs.promises.access(imagePath);
    
                const extname = path.extname(imagePath).toLowerCase();
                if (!['.png', '.jpg', '.jpeg', '.gif'].includes(extname)) {
                    console.error(`Invalid image format for file=${imagePath}:`, extname);
                    res.status(400).json({ error: `Invalid image format: ${extname}` });
                    return;
                }
    
                if (row.value) {
                    try {
                        row.value = JSON.parse(row.value);
                    } catch {
                        // Leave it as a string if not JSON-parsable
                    }
                }
    
                const response = {
                    ...row,
                    imageUrl: `/images/${row.image}`,
                    imageUrl2: `/images/${row.image2}`,
                    specialPositionsUrl: `/special_positions/${row.specialPositions}`
                };
    
                res.json(response);
            } catch (fileErr) {
                console.error(`File access error for path=${imagePath}:`, fileErr.message);
                res.status(404).json({ error: 'Image file not found' });
            }
        }
    );
});

app.listen(3000, () => {
    console.log('Started server on http://localhost:3000');
});