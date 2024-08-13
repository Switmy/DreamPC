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
            image TEXT NOT NULL
        )`);

        // Insertion des données
        const composants = [
            { type: 'cpu', value: 'intel-core-i5', name: 'Intel Core i5', image: 'intel-core-i5.png' },
            { type: 'cpu', value: 'amd-ryzen-7', name: 'AMD Ryzen 7', image: 'amd-ryzen-7.png' },
            { type: 'cpu', value: 'intel-core-i9', name: 'Intel Core i9', image: 'intel-core-i9.png' },
            { type: 'gpu', value: 'nvidia-gtx-1660-ti', name: 'NVIDIA GeForce GTX 1660 Ti', image: 'nvidia-gtx-1660-ti.png' },
            { type: 'gpu', value: 'amd-rx-5600-xt', name: 'AMD Radeon RX 5600 XT', image: 'amd-rx-5600-xt.png' },
            { type: 'gpu', value: 'intel-iris-xe', name: 'Intel Iris Xe Graphics', image: 'intel-iris-xe.png' },
            { type: 'ram', value: '8go', name: '8 Go', image: 'ram-8go.png' },
            { type: 'ram', value: '16go', name: '16 Go', image: 'ram-16go.png' },
            { type: 'ram', value: '32go', name: '32 Go', image: 'ram-32go.png' },
            { type: 'disque-dur', value: '1to-ssd', name: '1 To SSD', image: '1to-ssd.png' },
            { type: 'disque-dur', value: '2to-hdd', name: '2 To HDD', image: '2to-hdd.png' },
            { type: 'disque-dur', value: '4to-nvme', name: '4 To NVMe', image: '4to-nvme.png' }
        ];

        // Prépare l'insertion des composants
        const stmt = db.prepare(`INSERT INTO composants (type, value, image) VALUES (?, ?, ?)`);

        composants.forEach(composants => {
            stmt.run(composants.type, composants.value, composants.image);
        });

        stmt.finalize();
    });

    return db;
}

module.exports = { createDatabase };
