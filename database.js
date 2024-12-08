const sqlite3 = require('sqlite3').verbose();

// Fonction pour créer la base de données et insérer des données
function createDatabase() {
    const db = new sqlite3.Database('./components-db.sqlite');

    // Crée la table 'components' si elle n'existe pas
    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS components');
        db.run(`CREATE TABLE IF NOT EXISTS components (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            value TEXT NOT NULL,
            name TEXT NOT NULL,
            image TEXT NOT NULL
        )`);
        // Insertion des données
        const components = [
            { type: 'case', name: 'ATX NZXT H9 Flow 2024', image: 'nzxt-h9-2024-flow.png'},
            { type: 'case', name: 'microATX Asus Prime AP201', image: 'asusprime-AP201.png'},
            { type: 'case', name: 'ATX NZXT H5 Flow 2023', image: 'nzxt-h5-2023-flow.png'},
            { type: 'case', name: 'microATX Deepcool Matrexx 40', image: 'deepcool-matrexx-40-3fs.png'},
            { type: 'case', name: 'ATX Deepcool CH560 Digital', image: 'deepcool-ch560-digital.png'},
            { type: 'case', name: 'ATX Corsair ICUE 5000X White', image: 'corsair-icue-5000x-white.png'},
            { type: 'case', name: 'ATX Cooler-Master Masterbox NR200P White', image: 'coolermaster-masterbox-nr200p-white.png'},
            { type: 'gpu', value: 'gigabyte-aero-4080', name: 'Gigabyte Aero 4080', image: 'gigabyte-4080-aero.png'},
            { type: 'gpu', value:'msi-gaming-x-slim-xt-4060-ti', name: 'MSI Gaming-X Slim 4060-ti', image: 'msi-4060-ti-gaming-x-slim.png'},
            { type: 'gpu', value:'asus-rog-strix-4080', name: 'Asus ROG STRIX 4080', image: 'rog-4080-strix.png'},
            { type: 'gpu', value:'asus-tuf-4080', name: 'Asus TUF 4080', image: 'tuf-4080.png'},
            { type: 'gpu', value:'asus-tuf-rx-7900-xt', name: 'Asus TUF RX 7900XT', image: 'tuf-rx-7900-xt.png'},
            { type: 'ram', value:'teamgroup-t-force-delta-rgb-2x8gb-ddr5', name: 'Teamgroup T Force Delta RGB 16GB (2x8gb) DDR5', image: 'teamgroup-t-force-delta-rgb-ddr5.png'},
            { type: 'ram', value:'teamgroup-t-force-delta-rgb-2x16gb-ddr5', name: 'Teamgroup T Force Delta RGB 32GB (2x16gb) DDR5', image: 'teamgroup-t-force-delta-rgb-ddr5.png'},
            { type: 'ram', value:'teamgroup-t-force-delta-rgb-2x16gb-ddr5', name: 'Teamgroup T Force Delta RGB 64GB (2x32gb) DDR5', image: 'teamgroup-t-force-delta-rgb-ddr5.png'},
        ];

        // Prépare l'insertion des components
        const stmt = db.prepare(`INSERT INTO components (type, value, name, image) VALUES (?, ?, ?, ?)`);

        components.forEach(components => {
            stmt.run(components.type, components.value, components.name, components.image);
        });

        stmt.finalize();
    });

    return db;
}

module.exports = { createDatabase };
