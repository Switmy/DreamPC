const sqlite3 = require('sqlite3').verbose();

// Fonction pour créer la base de données et insérer des données
function createDatabase() {
    const db = new sqlite3.Database('./composants-db.sqlite');

    // Crée la table 'composants' si elle n'existe pas
    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS composants');
        db.run(`CREATE TABLE IF NOT EXISTS composants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            value TEXT NOT NULL,
            name TEXT NOT NULL,
            image TEXT NOT NULL
        )`);

        // Insertion des données
        const composants = [
            { type: 'case', name: 'ATX NZXT H9 Flow 2024', image: 'nzxt-h9-2024-flow.png'},
            { type: 'case', name: 'microATX Asus Prime AP201', image: 'asusprime-AP201.png'},
            { type: 'case', name: 'ATX NZXT H5 Flow 2023', image: 'nzxt-h5-2023-flow.png'},
            { type: 'case', name: 'microATX Deepcool Matrexx 40', image: 'deepcool-matrexx-40-3fs.png'},
            { type: 'case', name: 'ATX Deepcool CH560 Digital', image: 'deepcool-ch560-digital.png'},
            { type: 'case', name: 'ATX Corsair ICUE 5000X White', image: 'corsair-icue-5000x-white.png'},
            { type: 'case', name: 'ATX Corsair ICUE 5000X White', image: 'corsair-icue-5000x-white.png'},
            { type: 'case', name: 'ATX Cooler-Master Masterbox NR200P White', image: 'coolermaster-masterbox-nr200p-white.png'},
            { type: 'gpu', name: 'Gigabyte Aero 4080', image: 'gigabyte-4080-aero.png'},
            { type: 'gpu', name: 'MSI Gaming-X Slim 4060-ti', image: 'msi-4060-ti-gaming-x-slim.png'},
            { type: 'gpu', name: 'Asus ROG STRIX 4080', image: 'rog-4080-strix.png'},
            { type: 'gpu', name: 'Asus TUF 4080', image: 'tuf-4080.png'},
        ];
        //value:'corsair-icue-5000x-white',
        //value:'deepcool-ch560-digital', 
        //value:'deepcool-matrexx-40-3fs',
        //value:'nzxt-h5-flow-2023',
        //value:'asus-AP201',
        //value:'nzxt-h9-flow-2024',

        // Prépare l'insertion des composants
        const stmt = db.prepare(`INSERT INTO composants (type, value, name, image) VALUES (?, ?, ?, ?)`);

        composants.forEach(composants => {
            stmt.run(composants.type, composants.value, composants.name, composants.image);
        });

        stmt.finalize();
    });

    return db;
}

module.exports = { createDatabase };
