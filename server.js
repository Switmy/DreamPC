const express = require('express');
const cors = require('cors');
const { createDatabase } = require('./database');

const app = express();
app.use(cors()); // Ajout de CORS pour permettre les requêtes cross-origin

const db = createDatabase();

// Exemple de route pour récupérer les images associées aux composants
app.get('/api/composants/:type/:value', (req, res) => {
    const { type, value } = req.params;

    // Requête SQL pour récupérer l'image associée à l'option sélectionnée
    db.get(`SELECT image FROM composants WHERE type = ? AND value = ?`, [type, value], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            // Envoyer l'image trouvée
            res.sendFile(__dirname + '/images/' + row.image);
        } else {
            res.status(404).json({ error: 'Option non trouvée' });
        }
    });
});

// Exemple de route pour récupérer les images associées aux composants
app.get('/api/composants/:type', (req, res) => {
    const { type} = req.params;

    // Requête SQL pour récupérer l'image associée à l'option sélectionnée
    db.get(`SELECT image FROM composants WHERE type = ?`, [type], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            // Envoyer l'image trouvée
            res.sendFile(__dirname + '/images/' + row.image);
        } else {
            res.status(404).json({ error: 'Option non trouvée' });
        }
    });
});

// Démarrer le serveur sur le port 3000
app.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
