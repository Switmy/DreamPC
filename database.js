const sqlite3 = require('sqlite3').verbose();

// Fonction pour créer la base de données et insérer des données
function createDatabase() {
    const db = new sqlite3.Database('./components-db.sqlite');

    // Crée la table 'components' si elle n'existe pas
    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS components');
        db.run(`CREATE TABLE IF NOT EXISTS components (
        type TEXT,
        name TEXT,
        image TEXT,
        image2 TEXT,
        format TEXT,
        quantity INTEGER DEFAULT 1,
        rgb TEXT,
        casetype TEXT,
        fancapacity INTEGER,
        aiofanQuantity INTEGER DEFAULT 1,
        aiofan INTEGER,
        specialPositions TEXT,
        value INTEGER PRIMARY KEY AUTOINCREMENT
        )`);
        // Insertion des données
        const components = [
            { type: 'case', name: 'ATX NZXT H9 Flow 2024', image: '1.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: 'aquarium', fancapacity: 10 },
            { type: 'case', name: 'mATX Asus Prime AP201', image: '2.png', image2: null, format: "mATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 7 },
            { type: 'case', name: 'ATX NZXT H5 Flow 2023', image: '3.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 5 },
            { type: 'case', name: 'mATX Deepcool Matrexx 40', image: '4.png', image2: null, format: "mATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 6 },
            { type: 'case', name: 'ATX Deepcool CH560 Digital', image: '5.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 7 },
            { type: 'case', name: 'mATX Zalman P30 V2', image: '6.png', image2: null, format: "mATX", quantity: 1, rgb: null, casetype: 'aquarium', fancapacity: 6 },
            { type: 'case', name: 'mATX Jonsbo D32 Pro', image: '7.png', image2: null, format: "mATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 6 },
            { type: 'case', name: "mATX Jonsbo TK1", image: '8.png', image2: null, format: "mATX", quantity: 1, rgb: null, casetype: null, fancapacity: 4 },
            { type: 'case', name: 'mITX Fractal Design Torrent Nano', image: '9.png', image2: null, format: "mITX", quantity: 1, rgb: null, casetype: null, fancapacity: 3, specialPositions: '9.json' },
            { type: 'case', name: 'ATX Corsair ICUE 5000X White', image: '10.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 7 },
            { type: 'case', name: 'mITX Cooler-Master Masterbox NR200P White', image: '11.png', image2: null, format: "mITX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 5 },
            { type: 'case', name: 'EATX Asus Hyperion GR701 White', image: '12.png', image2: null, format: "EATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 7 },
            { type: 'case', name: 'ATX NZXT H7 Flow 2024', image: '13.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 10 },
            { type: 'gpu', name: 'Gigabyte Aero 4080', image: '14.png', image2: '14.1.png', format: "EATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'gpu', name: 'MSI Gaming-X Slim 4060-ti', image: '15.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'gpu', name: 'Asus ROG STRIX 4080', image: '16.png', image2: null, format: "EATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'gpu', name: 'Asus TUF 4080', image: '17.png', image2: null, format: "EATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'gpu', name: 'Asus TUF RX 7900XT', image: '18.png', image2: null, format: "EATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'gpu', name: 'MSI Ventus 2X 4060', image: '19.png', image2: null, format: "mATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', name: 'Asus Rog Strix Z690I mItx', image: '20.png', image2: null, format: "mITX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', name: 'Gigabyte AERO B650 G Atx', image: '21.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', name: 'Gigabyte Aorus X670 Elite AX Atx', image: '22.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', name: 'Msi MPG Z490M Edge mAtx', image: '23.png', image2: null, format: "mATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', name: 'Msi Pro H610M-E mAtx', image: '24.png', image2: null, format: "mATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', name: 'Asus Rog Maximus Z790 Hero Atx', image: '25.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', name: 'Asus Rog Strix Z270-I Gaming mItx', image: '26.png', image2: null, format: "mITX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', name: 'Asus Prime Z490-A Atx', image: '27.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'aio', name: 'Nzxt Kraken Z73 360mm Aio', image: '28.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null, aioFanQuantity:3, aioFan:37 },
            { type: 'aio', name: 'Nzxt Kraken Z73 280mm Aio', image: '28.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null, aioFanQuantity:2, aioFan:37 },
            { type: 'aio', name: 'Nzxt Kraken Z73 240mm Aio', image: '28.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null, aioFanQuantity:2, aioFan:37 },
            { type: 'aio', name: 'Rog Ryujin II 360mm Aio', image: '31.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null, aioFanQuantity:3, aioFan:38 },
            { type: 'aio', name: 'Rog Ryujin II 360mm ARGB Aio', image: '31.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null, aioFanQuantity:2, aioFan:38 },
            { type: 'aio', name: 'Corsair iCUE H150i Elite 360mm Aio', image: '33.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null, aioFanQuantity:3, aioFan:38 },
            { type: 'aircooler', name: 'Thermalright Peerless Assassin 120 SE Air-Cooler', image: '34.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'aircooler', name: 'Deepcool AK620 Air-Cooler', image: '35.png', image2: null, format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'fans', name: 'Arctic P12 MAX 120mm', image: '36.png', image2: "36.1.png", format: "mITX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'fans', name: 'NZXT F120 RGB 120mm', image: '37.png', image2: "37.1.png", format: "mITX", quantity: 1, rgb: "rgb", casetype: null, fancapacity: null },
            { type: 'fans', name: 'Thermalright TL C12CW S White 120mm', image: '38.png', image2: "38.1.png", format: "mITX", quantity: 1, rgb: "rgb", casetype: null, fancapacity: null },
            { type: 'fans', name: 'Pack of 3 Thermalright TL C12CW S White 120mm', image: '38.png', image2: "38.1.png", format: "mITX", quantity: 3, rgb: "rgb", casetype: null, fancapacity: null },
            //{ type: 'ram', value:'teamgroup-t-force-delta-rgb-2x8gb-ddr5', name: 'Teamgroup T Force Delta RGB 16GB (2x8gb) DDR5', image: 'teamgroup-t-force-delta-rgb-ddr5.png', format: null, quantity: 2},
            //{ type: 'ram', value:'teamgroup-t-force-delta-rgb-2x16gb-ddr5', name: 'Teamgroup T Force Delta RGB 32GB (2x16gb) DDR5', image: 'teamgroup-t-force-delta-rgb-ddr5.png', format: null, quantity: 2},
            //{ type: 'ram', value:'teamgroup-t-force-delta-rgb-2x32gb-ddr5', name: 'Teamgroup T Force Delta RGB 64GB (2x32gb) DDR5', image: 'teamgroup-t-force-delta-rgb-ddr5.png', format: null, quantity: 2},
            //{ type: 'ram', value:'corsair-vengeance-rgb-2x8gb-ddr5', name: 'Corsair Vengeance RGB 16GB (2x8gb) DDR5', image: 'corsair-vengeance-rgb-ddr5.png', format: null, quantity: 2},
            //{ type: 'ram', value:'corsair-vengeance-rgb-2x16gb-ddr5', name: 'Corsair Vengeance RGB 32GB (2x16gb) DDR5', image: 'corsair-vengeance-rgb-ddr5.png', format: null, quantity: 2},
            //{ type: 'ram', value:'corsair-vengeance-rgb-2x32gb-ddr5', name: 'Corsair Vengeance RGB 64GB (2x32gb) DDR5', image: 'corsair-vengeance-rgb-ddr5.png', format: null, quantity: 2},
        ];

        // Prépare l'insertion des components
        const stmt = db.prepare(`INSERT INTO components (type, name, image, image2, format, quantity, rgb, casetype, fancapacity, aioFanQuantity, aioFan, specialPositions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        components.forEach(component => {
            stmt.run(component.type, component.name, component.image, component.image2, component.format, component.quantity, component.rgb, component.casetype, component.fancapacity, component.aioFanQuantity, component.aioFan, component.specialPositions);
        });

        stmt.finalize();
    });

    return db;
}

module.exports = { createDatabase };
