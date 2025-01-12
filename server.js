const express = require('express');
const cors = require('cors');
const { createDatabase } = require('./database');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors()); // Cors for cross-origin requests

const db = createDatabase();

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/api/components/:type/:value', (req, res) => {
    const { type, value } = req.params;

    // Validate inputs (basic example, consider stricter validation based on your requirements)
    if (!type||!value) {
        res.status(400).json({error: 'type and value are not validated'})
        return;
    }

    //get the image and do all validations
    db.get(
        `SELECT image, value FROM components WHERE type = ? AND value = ?`,
        [type, value],
        async (err, row) => {
            if (err) {
                console.error('Database error:', err.message);
                res.status(500).json({ error: 'Database error occurred' });
                return;
            }
    
            if (!row) {
                res.status(404).json({ error: `Component not found for type=${type} and value=${value}` });
                return;
            }
    
            const imagePath = path.join(__dirname, 'images', row.image);
    
            try {
                await fs.promises.access(imagePath);
    
                // Validate file extension
                const extname = path.extname(imagePath).toLowerCase();
                if (!['.png', '.jpg', '.jpeg', '.gif'].includes(extname)) {
                    res.status(400).json({ error: `Invalid image format: ${extname}` });
                    return;
                }
    
                // Check if value is JSON-parsable
                let parsedValue;
                try {
                    parsedValue = JSON.parse(row.value);
                } catch {
                    parsedValue = row.value; // Treat it as a plain string if not JSON
                }
    
                const imageUrl = `/images/${row.image}`; // Path for static serving
                res.json({ imageUrl, value: parsedValue });
            } catch (fileErr) {
                console.error('File access error:', fileErr.message);
                res.status(404).json({ error: 'Image file not found' });
            }
        }
    );    
});

app.listen(3000, () => {
    console.log('Started server on http://localhost:3000');
});

