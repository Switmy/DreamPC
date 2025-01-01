const express = require('express');
const cors = require('cors');
const { createDatabase } = require('./database');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors()); // Ajout de CORS pour permettre les requêtes cross-origin

const db = createDatabase();

// Exemple de route pour récupérer les images associées aux composants
app.get('/api/components/:type/:value', (req, res) => {
    const { type, value } = req.params;

    // Requête SQL pour récupérer l'image associée à l'option sélectionnée
    db.get(`SELECT image FROM components WHERE type = ? AND value = ?`, [type, value], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row && row.image) {
            try {
                // Construction du chemin absolu de l'image
                const imagePath = path.join(__dirname, 'images', row.image);

                // Vérification si le fichier existe
                fs.promises.access(imagePath) // Utilisation de la version asynchrone
                    .then(() => {
                        // Vérification que l'extension est bien une image (par exemple, jpg, png, jpeg, gif)
                        const extname = path.extname(imagePath).toLowerCase();
                        if (['.png', '.jpg', '.jpeg', '.gif'].includes(extname)) {
                            res.sendFile(imagePath);
                        } else {
                            res.status(415).send('Unsupported File format'); // 415 Unsupported Media Type
                        }
                    })
                    .catch(() => {
                        // Si le fichier n'existe pas
                        res.status(404).send('Image not found');
                    });
            } catch (err) {
                // Gestion des erreurs générales
                console.error(err);
                res.status(500).send('Error when sending image');
            }
        } else {
            // Si `row` est nul ou non défini
            res.status(400).send('Non-valid Image data');
        }
    });
});

// Démarrer le serveur sur le port 3000
app.listen(3000, () => {
    console.log('Started server on http://localhost:3000');
});
