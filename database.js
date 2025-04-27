const sqlite3 = require('sqlite3').verbose();

// Fonction pour créer la base de données et insérer des données
function createDatabase() {
    const db = new sqlite3.Database('./components-db.sqlite');

    // Crée la table 'components' si elle n'existe pas
    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS components');
        db.run(`CREATE TABLE IF NOT EXISTS components (
        type TEXT,
        value TEXT,
        name TEXT,
        image TEXT,
        format TEXT,
        quantity INTEGER DEFAULT 1,
        rgb TEXT,
        casetype TEXT,
        fancapacity INTEGER
        )`);
        // Insertion des données
        const components = [
            { type: 'case', value: "221", name: 'ATX NZXT H9 Flow 2024', image: '221.png', format: "ATX", quantity: 1, rgb: null, casetype: 'aquarium', fancapacity: 10 },
            { type: 'case', value: "222", name: 'mATX Asus Prime AP201', image: '222.png', format: "mATX", quantity: 1, rgb: null, casetype: 'normal-2', fancapacity: 7 },
            { type: 'case', value: "276", name: 'ATX NZXT H5 Flow 2023', image: '276.png', format: "ATX", quantity: 1, rgb: null, casetype: 'normal-2', fancapacity: 5 },
            { type: 'case', value: "40", name: 'mATX Deepcool Matrexx 40', image: '40.png', format: "mATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 6 },
            { type: 'case', value: "560", name: 'ATX Deepcool CH560 Digital', image: '560.png', format: "ATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 7 },
            { type: 'case', value: "89", name: 'mATX Zalman P30 V2', image: '89.png', format: "mATX", quantity: 1, rgb: null, casetype: 'aquarium', fancapacity: 6 },
            { type: 'case', value: "323", name: 'mATX Jonsbo D32 Pro', image: '323.png', format: "mATX", quantity: 1, rgb: null, casetype: 'normal-2', fancapacity: 6 },
            { type: 'case', value: "122", name: "mATX Jonsbo TK1", image: '122.png', format: "mATX", quantity: 1, rgb: null, casetype: null, fancapacity: 4 },
            { type: 'case', value: "231", name: 'mITX Fractal Design Torrent Nano', image: '231.png', format: "mITX", quantity: 1, rgb: null, casetype: null, fancapacity: 3 },
            { type: 'case', value: "500", name: 'ATX Corsair ICUE 5000X White', image: '500.png', format: "ATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 7 },
            { type: 'case', value: "4", name: 'mITX Cooler-Master Masterbox NR200P White', image: '4.png', format: "mITX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 5 },
            { type: 'case', value: "20", name: 'EATX Asus Hyperion GR701 White', image: '20.png', format: "EATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 7 },
            { type: 'case', value: "244", name: 'ATX NZXT H7 Flow 2024', image: '244.png', format: "ATX", quantity: 1, rgb: null, casetype: 'normal', fancapacity: 10 },
            { type: 'gpu', value: "290", name: 'Gigabyte Aero 4080', image: '290.png', format: "EATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'gpu', value: "10", name: 'MSI Gaming-X Slim 4060-ti', image: '10.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'gpu', value: "54", name: 'Asus ROG STRIX 4080', image: '54.png', format: "EATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'gpu', value: "7", name: 'Asus TUF 4080', image: '7.png', format: "EATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'gpu', value: "78", name: 'Asus TUF RX 7900XT', image: '78.png', format: "EATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'gpu', value: "55", name: 'MSI Ventus 2X 4060', image: '55.png', format: "mATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', value: "3", name: 'Asus Rog Strix Z690I mItx', image: '3.png', format: "mITX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', value: "237", name: 'Gigabyte AERO B650 G Atx', image: '237.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', value: "670", name: 'Gigabyte Aorus X670 Elite AX Atx', image: '670.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', value: "304", name: 'Msi MPG Z490M Edge mAtx', image: '304.png', format: "mATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', value: "602", name: 'Msi Pro H610M-E mAtx', image: '602.png', format: "mATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', value: "790", name: 'Asus Rog Maximus Z790 Hero Atx', image: '790.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', value: "1", name: 'Asus Rog Strix Z270-I Gaming mItx', image: '1.png', format: "mITX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'motherboard', value: "490", name: 'Asus Prime Z490-A Atx', image: '490.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'aio', value: "19", name: 'Nzxt Kraken Z73 360mm Aio', image: '19.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'aio', value: "19", name: 'Nzxt Kraken Z73 280mm Aio', image: '19.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'aio', value: "19", name: 'Nzxt Kraken Z73 240mm Aio', image: '19.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null},
            { type: 'aio', value: "2", name: 'Rog Ryujin II 360mm Aio', image: '2.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'aio', value: "2", name: 'Rog Ryujin II 360mm ARGB Aio', image: '2.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'aio', value: "177", name: 'Corsair iCUE H150i Elite 360mm Aio', image: '177.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'aircooler', value: "39", name: 'Thermalright Peerless Assassin 120 SE Air-Cooler', image: '39.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'aircooler', value: "123", name: 'Deepcool AK620 Air-Cooler', image: '123.png', format: "ATX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'fans', value: "254", name: 'Arctic P12 MAX 120mm', image: '254.png', format: "mITX", quantity: 1, rgb: null, casetype: null, fancapacity: null },
            { type: 'fans', value: "352", name: 'NZXT F120 RGB 120mm', image: '352.png', format: "mITX", quantity: 1, rgb: "rgb", casetype: null, fancapacity: null },
            { type: 'fans', value: "309", name: 'Thermalright TL C12CW S White 120mm', image: '309.png', format: "mITX", quantity: 1, rgb: "rgb", casetype: null, fancapacity: null },
            { type: 'fans', value: "309.1", name: 'Pack of 3 Thermalright TL C12CW S White 120mm', image: '309.png', format: "mITX", quantity: 3, rgb: "rgb", casetype: null, fancapacity: null },
            //{ type: 'ram', value:'teamgroup-t-force-delta-rgb-2x8gb-ddr5', name: 'Teamgroup T Force Delta RGB 16GB (2x8gb) DDR5', image: 'teamgroup-t-force-delta-rgb-ddr5.png', format: null, quantity: 2},
            //{ type: 'ram', value:'teamgroup-t-force-delta-rgb-2x16gb-ddr5', name: 'Teamgroup T Force Delta RGB 32GB (2x16gb) DDR5', image: 'teamgroup-t-force-delta-rgb-ddr5.png', format: null, quantity: 2},
            //{ type: 'ram', value:'teamgroup-t-force-delta-rgb-2x32gb-ddr5', name: 'Teamgroup T Force Delta RGB 64GB (2x32gb) DDR5', image: 'teamgroup-t-force-delta-rgb-ddr5.png', format: null, quantity: 2},
            //{ type: 'ram', value:'corsair-vengeance-rgb-2x8gb-ddr5', name: 'Corsair Vengeance RGB 16GB (2x8gb) DDR5', image: 'corsair-vengeance-rgb-ddr5.png', format: null, quantity: 2},
            //{ type: 'ram', value:'corsair-vengeance-rgb-2x16gb-ddr5', name: 'Corsair Vengeance RGB 32GB (2x16gb) DDR5', image: 'corsair-vengeance-rgb-ddr5.png', format: null, quantity: 2},
            //{ type: 'ram', value:'corsair-vengeance-rgb-2x32gb-ddr5', name: 'Corsair Vengeance RGB 64GB (2x32gb) DDR5', image: 'corsair-vengeance-rgb-ddr5.png', format: null, quantity: 2},
        ];

        // Prépare l'insertion des components
        const stmt = db.prepare(`INSERT INTO components (type, value, name, image, format, quantity, rgb, casetype, fancapacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        components.forEach(component => {
            stmt.run(component.type, component.value, component.name, component.image, component.format, component.quantity, component.rgb, component.casetype, component.fancapacity);
        });

        stmt.finalize();
    });

    return db;
}

module.exports = { createDatabase };
