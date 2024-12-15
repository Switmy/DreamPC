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
            { type: 'case', value:"nzxt-h9-flow-2024-atx", name: 'ATX NZXT H9 Flow 2024', image: 'nzxt-h9-2024-flow.png'},
            { type: 'case', value:"asus-prime-AP201-matx", name: 'microATX Asus Prime AP201', image: 'asusprime-AP201.png'},
            { type: 'case', value:"nzxt-h5-flow-2023-atx", name: 'ATX NZXT H5 Flow 2023', image: 'nzxt-h5-2023-flow.png'},
            { type: 'case', value:"deepcool-matrexx-40-3fs-matx", name: 'microATX Deepcool Matrexx 40', image: 'deepcool-matrexx-40-3fs.png'},
            { type: 'case', value:"deepcool-ch560-digital-atx", name: 'ATX Deepcool CH560 Digital', image: 'deepcool-ch560-digital.png'},
            { type: 'case', value:"corsair-icue-5000x-atx-white", name: 'ATX Corsair ICUE 5000X White', image: 'corsair-icue-5000x-white.png'},
            { type: 'case', value:"coolermaster-masterbox-nr200p-mitx-white", name: 'microITX Cooler-Master Masterbox NR200P White', image: 'coolermaster-masterbox-nr200p-white.png'},
            { type: 'gpu', value:'gigabyte-aero-4080', name: 'Gigabyte Aero 4080', image: 'gigabyte-4080-aero.png'},
            { type: 'gpu', value:'msi-gaming-x-slim-xt-4060-ti', name: 'MSI Gaming-X Slim 4060-ti', image: 'msi-4060-ti-gaming-x-slim.png'},
            { type: 'gpu', value:'asus-rog-strix-4080', name: 'Asus ROG STRIX 4080', image: 'rog-4080-strix.png'},
            { type: 'gpu', value:'asus-tuf-4080', name: 'Asus TUF 4080', image: 'tuf-4080.png'},
            { type: 'gpu', value:'asus-tuf-rx-7900-xt', name: 'Asus TUF RX 7900XT', image: 'tuf-rx-7900-xt.png'},
            { type: 'ram', value:'teamgroup-t-force-delta-rgb-2x8gb-ddr5', name: 'Teamgroup T Force Delta RGB 16GB (2x8gb) DDR5', image: 'teamgroup-t-force-delta-rgb-ddr5.png'},
            { type: 'ram', value:'teamgroup-t-force-delta-rgb-2x16gb-ddr5', name: 'Teamgroup T Force Delta RGB 32GB (2x16gb) DDR5', image: 'teamgroup-t-force-delta-rgb-ddr5.png'},
            { type: 'ram', value:'teamgroup-t-force-delta-rgb-2x32gb-ddr5', name: 'Teamgroup T Force Delta RGB 64GB (2x32gb) DDR5', image: 'teamgroup-t-force-delta-rgb-ddr5.png'},
            { type: 'ram', value:'corsair-vengeance-rgb-2x8gb-ddr5', name: 'Corsair Vengeance RGB 16GB (2x8gb) DDR5', image: 'corsair-vengeance-rgb-ddr5.png'},
            { type: 'ram', value:'corsair-vengeance-rgb-2x16gb-ddr5', name: 'Corsair Vengeance RGB 32GB (2x16gb) DDR5', image: 'corsair-vengeance-rgb-ddr5.png'},
            { type: 'ram', value:'corsair-vengeance-rgb-2x32gb-ddr5', name: 'Corsair Vengeance RGB 64GB (2x32gb) DDR5', image: 'corsair-vengeance-rgb-ddr5.png'},
            { type: 'ram', value:'g.skill-trident-z-rgb-2x8gb-ddr4', name: 'G.Skill Trident Z RGB 16GB (2x8gb) DDR4', image: 'g.skill-trident-z-rgb-ddr4.png'},
            { type: 'ram', value:'g.skill-trident-z-rgb-2x16gb-ddr4', name: 'G.Skill Trident Z RGB 32GB (2x16gb) DDR4', image: 'g.skill-trident-z-rgb-ddr4.png'},
            { type: 'ram', value:'g.skill-trident-z-rgb-2x32gb-ddr4', name: 'G.Skill Trident Z RGB 64GB (2x32gb) DDR4', image: 'g.skill-trident-z-rgb-ddr4.png'},
            { type: 'ram', value:'g.skill-trident-z5-rgb-2x8gb-ddr5', name: 'G.Skill Trident Z5 RGB 16GB (2x8gb) DDR5', image: 'g.skill-trident-z5-rgb-ddr5.png'},
            { type: 'ram', value:'g.skill-trident-z5-rgb-2x16gb-ddr5', name: 'G.Skill Trident Z5 RGB 32GB (2x16gb) DDR5', image: 'g.skill-trident-z5-rgb-ddr5.png'},
            { type: 'ram', value:'g.skill-trident-z5-rgb-2x32gb-ddr5', name: 'G.Skill Trident Z5 RGB 64GB (2x32gb) DDR5', image: 'g.skill-trident-z5-rgb-ddr5.png'},
            { type: 'ram', value:'g.skill-trident-z5-rgb-2x8gb-ddr5-white', name: 'G.Skill Trident Z5 RGB 16GB (2x8gb) DDR5 White', image: 'g.skill-trident-z5-rgb-ddr5-white.png'},
            { type: 'ram', value:'g.skill-trident-z5-rgb-2x16gb-ddr5-white', name: 'G.Skill Trident Z5 RGB 32GB (2x16gb) DDR5 White', image: 'g.skill-trident-z5-rgb-ddr5-white.png'},
            { type: 'ram', value:'g.skill-trident-z5-rgb-2x32gb-ddr5-white', name: 'G.Skill Trident Z5 RGB 64GB (2x32gb) DDR5 White', image: 'g.skill-trident-z5-rgb-ddr5-white.png'},
            //{ type: 'storage', value:'crucial-p3-plus-1-tb-ssd', name: 'Crucial P3 Plus 1 TB SSD'},
            //{ type: 'storage', value:'crucial-p3-plus-2-tb-ssd', name: 'Crucial P3 Plus 2 TB SSD'},
            //{ type: 'storage', value:'samsung-990-pro-1-tb-ssd', name: 'Samsung 990 Pro 1 TB SSD'},
            //{ type: 'storage', value:'samsung-990-pro-2-tb-ssd', name: 'Samsung 990 Pro 2 TB SSD'},
            //{ type: 'storage', value:'seagate-barracuda-4-tb-hdd', name: 'Seagate BarraCuda 4 TB HDD'},
            //{ type: 'storage', value:'seagate-barracuda-compute-8-tb-hdd', name: 'Seagate BarraCuda Compute 8 TB HDD'},
            { type: 'motherboard', value:'asus-rog-strix-z690-i-mitx', name: 'Asus Rog Strix Z690I mItx', image: 'asus-rog-strix-z690-i.png'},
            { type: 'motherboard', value:'gigabyte-b650-aero-g-atx', name: 'Gigabyte AERO B650 G Atx', image: 'gigabyte-b650-aero-g.png'},
            { type: 'motherboard', value:'gigabyte-x670-aorus-elite-ax-atx', name: 'Gigabyte Aorus X670 Elite AX Atx', image: 'gigabyte-b650-aero-g.png'},
            { type: 'motherboard', value:'msi-z490m-mpg-edge-matx', name: 'Msi MPG Z490M Edge mAtx', image: 'msi-mpg-z490m-edge.png'},
            { type: 'motherboard', value:'msi-h610m-e-pro-matx', name: 'Msi Pro H610M-E mAtx', image: 'msi-pro-h610m-e.png'},
            { type: 'motherboard', value:'asus-rog-z790-maximus-hero-atx', name: 'Asus Rog Maximus Z790 Hero Atx', image: 'rog-maximus-z790-hero.png'},
            { type: 'motherboard', value:'asus-rog-z270-i-gaming-mitx', name: 'Asus Rog Strix Z270-I Gaming mItx', image: 'rog-strix-z270-i-gaming.png'},
            { type: 'motherboard', value:'asus-prime-z490-a-atx', name: 'Asus Prime Z490-A Atx', image: 'asus-prime-z490-a.png'},
            { type: 'cooler', value:'nzxt-kraken-z73-360mm-aio', name: 'Nzxt Kraken Z73 360mm Aio', image: 'nzxt-kraken.png', image2:'nzxt-f120-rgb.png'},
            { type: 'cooler', value:'nzxt-kraken-z73-280mm-aio', name: 'Nzxt Kraken Z73 280mm Aio', image: 'nzxt-kraken.png', image2:'nzxt-f120-rgb.png'},
            { type: 'cooler', value:'nzxt-kraken-z73-240mm-aio', name: 'Nzxt Kraken Z73 240mm Aio', image: 'nzxt-kraken.png', image2:'nzxt-f120-rgb.png'},
            { type: 'cooler', value:'rog-ryujin-ii-360mm-aio', name: 'Rog Ryujin II 360mm Aio', image: 'rog-ryujin-ii.png', image2:'arctic-p12-max.png'},
            { type: 'cooler', value:'rog-ryujin-ii-240mm-aio', name: 'Rog Ryujin II 240mm Aio', image: 'rog-ryujin-ii.png', image2:'arctic-p12-max.png'},
            { type: 'cooler', value:'rog-ryujin-ii-360mm-argb-aio', name: 'Rog Ryujin II 360mm ARGB Aio', image: 'rog-ryujin-ii.png', image2:'nzxt-f120-rgb.png'},
            { type: 'cooler', value:'rog-ryujin-ii-240mm-argb-aio', name: 'Rog Ryujin II 240mm ARGB Aio', image: 'rog-ryujin-ii.png', image2:'nzxt-f120-rgb.png'},
            { type: 'cooler', value:'thermalright-peerless-assassin-120-se-air-cooler', name: 'Thermalright Peerless Assassin 120 SE Air-Cooler', image: 'thermalright-peerless-assassin-120-se.png'},
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
