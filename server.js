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

// Fetch all data for a component by its value ID
app.get('/api/components/:value', (req, res) => {
    const { value } = req.params;

    // Validate input
    if (!value) {
        res.status(400).json({ error: '💀value parameter is required' });
        return;
    }

    // 1. Get main component data
    db.get(
        `SELECT * FROM main WHERE value = ?`,
        [value],
        async (err, mainRow) => {
            if (err) {
                console.error(`💀Database error fetching "main" data for value=${value}:`, err.message);
                res.status(500).json({ error: '💀Database error occurred' });
                return;
            }

            if (!mainRow) {
                console.warn(`💀Component Row not found in main table for value=${value}`);
                res.status(404).json({ error: `💀Component not found for value=${value}` });
                return;
            }

            console.log(`✅Fetched main data for value=${value}:`, mainRow);

            const type = mainRow.type; // Get the component type (cpu, gpu, ram, etc.)
            const tableName = type === 'case' ? 'case_' : type;

            try {
                // 2. Get specifications from type-specific table
                db.get(
                    `SELECT * FROM ${tableName} WHERE value = ?`,
                    [value],
                    (specErr, specRow) => {
                        if (specErr) {
                            console.error(`💀Database error fetching specs for type=${type}, value=${value}:`, specErr.message);
                            res.status(500).json({ error: '💀Database error occurred' });
                            return;
                        }
                        console.log(`✅Fetched specifications for value=${value}:`, specRow);

                        // 3. Get visualizer data
                        db.get(
                            `SELECT * FROM visualizer WHERE value = ?`,
                            [value],
                            async (vizErr, vizRow) => {
                                if (vizErr) {
                                    console.error(`💀Database error fetching visualizer data for value=${value}:`, vizErr.message);
                                    res.status(500).json({ error: '💀Database error occurred' });
                                    return;
                                }
                                console.log(`✅Fetched visualizer data for value=${value}:`, vizRow);

                                try {
                                    // Combine all data
                                    const response = {
                                        main: mainRow,
                                        specifications: specRow || null,
                                        visualizer: vizRow || null,
                                        imageUrl: vizRow?.image ? `/images/${vizRow.image}` : null,
                                        imageUrl2: vizRow?.image2 ? `/images/${vizRow.image2}` : null,
                                        specialPositionsUrl: vizRow?.specialPositions ? `/special_positions/${vizRow.specialPositions}` : null
                                    };
                                    console.log(`✅Combined data for value=${value}!`);

                                    res.json(response);
                                } catch (fileErr) {
                                    console.error(`💀File access error:`, fileErr.message);
                                    res.status(404).json({ error: '💀Image file not found' });
                                }
                            }
                        );
                    }
                );
            } catch (err) {
                console.error(`💀Unexpected error:`, err.message);
                res.status(500).json({ error: '💀Unexpected error occurred' });
            }
        }
    );
});

app.get('/api/components/:category', (req, res) => {
    const { category } = req.params;

    // Fetch components based on category
    db.get(
        `SELECT * FROM main WHERE category = ?`,
        [category],
        (err, rows) => {
            if (err) {
                console.error(`💀Database error fetching components for category=${category}:`, err.message);
                res.status(500).json({ error: '💀Database error occurred' });
                return;
            }
            res.json(rows);
        }
    );
});

app.listen(3000, () => {
    console.log('Started server on http://localhost:3000');
});