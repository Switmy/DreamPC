document.getElementById("submit-btn").addEventListener('click', async function () {
    const canvas = document.getElementById('configCanvas');
    const ctx = canvas.getContext('2d');

    if (!canvas || !ctx) {
        console.error("Canvas or context is not found.");
        return;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gpu = getSelectedValues('gpu');
    const aio = getSelectedValues('aio');
    const aircooler = getSelectedValues('aircooler');
    const motherboard = getSelectedValues('motherboard');
    const fans = getSelectedValues('fans');
    const Case = getSelectedValues('case');

    function getSelectedValues(name) {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
            .map(input => input.value.toLowerCase().replace(/ /g, '-'));
    }

    function fetchData(componentType, selectedValues) {
        return Promise.allSettled(selectedValues.map(value => {
            return fetch(`http://localhost:3000/api/components/${componentType}/${value}`)
                .then(res => res.json())
                .catch(error => {
                    console.error(`Error fetching ${componentType} (${value}):`, error);
                    return null; // Return null for failed fetches
                });
        })).then(results => results
            .filter(result => result.status === 'fulfilled' && result.value) // Filter out failed fetches
            .map(result => result.value));
    }

    function drawComponent(imageUrl, xposition, yposition, size) {
        return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
                ctx.drawImage(image, xposition, yposition, size, size); // size is used for both width and height
                resolve();
            };
            image.onerror = () => {
                console.warn(`Image not found: ${imageUrl}`);
                resolve(); // Skip this component
            };
            image.src = `http://localhost:3000${imageUrl}`;
        });
    }

    function setDimensions(format, positionSizeMapping, caseFormat) {
        if (!positionSizeMapping || !caseFormat) {
            console.warn("Position size mapping or case format is missing.");
            return null;
        }

        // Access the correct mapping based on the case format
        const caseMapping = positionSizeMapping[caseFormat];
        if (!caseMapping) {
            console.warn(`Case format "${caseFormat}" not found in position size mapping.`);
            return null;
        }

        // Access the dimensions for the given format
        const dimensions = caseMapping[format];
        if (!dimensions) {
            console.warn(`Format "${format}" not found in case mapping.`);
            return null;
        }

        return dimensions;
    }

    function getData(data, key) {
        if (Array.isArray(data) && data.length > 0) {
            return data[0][key]; // Access the key from the first object in the array
        }
        return undefined; // Return undefined if the array is empty or invalid
    }

    // GPU position size
    const gpuPositionSize = {
    atx : { eatx: {x: 160, y: 210, size: 340}, atx: { x: 160, y: 210, size: 290 }, matx: { x: 165, y: 260, size: 210 }, mitx: { x: 165, y: 260, size: 190 } },
    matx: { eatx: {x: 160, y: 220, size: 360}, atx: { x: 160, y: 220, size: 320 }, matx: { x: 165, y: 270, size: 230 }, mitx: { x: 165, y: 240, size: 200 } },
    mitx: { eatx: {x: 135, y: 245, size: 430}, atx: { x: 135, y: 245, size: 390 }, matx: { x: 135, y: 300, size: 290 }, mitx: { x: 135, y: 300, size: 270 } },
    eatx: { eatx: {x: 140, y: 240, size: 310}, atx: { x: 150, y: 250, size: 260 }, matx: { x: 150, y: 290, size: 180 }, mitx: { x: 150, y: 290, size: 160 } }
    };
    // motherboard position size
    const motherboardPositionSize = {
    atx: { atx: {x: 140, y: 190, size: 250}, matx: { x: 160, y: 200, size: 215 }, mitx: { x: 160, y: 190, size: 170 }, eatx: { x: 160, y: 190, size: 270 } },
    matx: { atx: {x: 165, y: 190, size: 230}, matx: { x: 160, y: 190, size: 245 }, mitx: { x: 160, y: 190, size: 215 }, eatx: { x: 165, y: 190, size: 250 } },
    mitx: { atx: {x: 160, y: 190, size: 230}, matx: { x: 160, y: 190, size: 210 }, mitx: { x: 130, y: 215, size: 240 }, eatx: { x: 160, y: 190, size: 250 } },
    eatx: { atx: {x: 130, y: 220, size: 240}, matx: { x: 160, y: 190, size: 250 }, mitx: { x: 160, y: 190, size: 230 }, eatx: { x: 160, y: 190, size: 260 } }
    };
    // RAM position size
    //const ramPositionSize = {
    //atx : { atx: { x: 280, y: 210, size: 110 }},
    //matx: { atx: { x: 300, y: 210, size: 130 }},
    //mitx: { atx: { x: 270, y: 220, size: 90 }},
    //eatx: { atx: { x: 270, y: 220, size: 120 }}
    //};
    // AIO position size
    const aioPositionSize = {
        atx: { atx: {x: 235, y: 230, size: 75}},
        matx: { atx: {x: 240, y: 230, size: 90}},
        mitx: { atx: {x: 220, y: 275, size: 100}},
        eatx: { atx: {x: 225, y: 260, size: 65}}
    };
    // aircooler position size
    const aircoolerPositionSize = {
        atx: { atx: {x: 200, y: 200, size: 140}, eatx: { x: 215, y: 200, size: 160 } },
        matx: { atx: {x: 205, y: 200, size: 160}, eatx: { x: 220, y: 200, size: 175 } },
        mitx: { atx: {x: 170, y: 230, size: 190}, eatx: { x: 180, y: 230, size: 210 } },
        eatx: { atx: {x: 195, y: 235, size: 115}, eatx: { x: 195, y: 235, size: 125 } }
    };
    // Fans position size
    const fansPositionSize = {
        atx: { atx: {x: 100, y: 210, size: 120}, matx: { x: 100, y: 210, size: 110 }, mitx: { x: 100, y: 210, size: 100 }, eatx: { x: 100, y: 210, size: 130 } },
        matx: { atx: {x: 100, y: 210, size: 110}, matx: { x: 100, y: 210, size: 100 }, mitx: { x: 100, y: 210, size: 90 }, eatx: { x: 100, y: 210, size: 120 } },
        mitx: { atx: {x: 100, y: 210, size: 100}, matx: { x: 100, y: 210, size: 90 }, mitx: { x: 100, y: 210, size: 80 }, eatx: { x: 100, y: 210, size: 110 } },
        eatx: { atx: {x: 100, y: 210, size: 130}, matx: { x: 100, y: 210, size: 120 }, mitx: { x: 100, y: 210, size: 110 }, eatx: { x: 100, y: 210, size: 140 } }
    };

    // Fetch data for each component type
    const [caseData, gpuData, motherboardData, aioData, aircoolerData, fansData] = await Promise.all([
        fetchData('case', Case),
        fetchData('gpu', gpu),
        fetchData('motherboard', motherboard),
        fetchData('aio', aio),
        fetchData('aircooler', aircooler),
        fetchData('fans', fans),
    ]);

    // Set dimensions for each component (2 paragrphs.)
    const caseFormat = caseData?.length > 0 ? getData(caseData, 'format').toLowerCase() : null;
    const gpuFormat = gpuData?.length > 0 ? getData(gpuData, 'format').toLowerCase() : null;
    const motherboardFormat = motherboardData?.length > 0 ? getData(motherboardData, 'format').toLowerCase() : null;
    const aioFormat = aioData?.length > 0 ? getData(aioData, 'format').toLowerCase() : null;
    const aircoolerFormat = aircoolerData?.length > 0 ? getData(aircoolerData, 'format').toLowerCase() : null;
    const fansFormat = fansData?.length > 0 ? getData(fansData, 'format').toLowerCase() : null;

    const gpuDimensions = gpuFormat ? setDimensions(gpuFormat, gpuPositionSize, caseFormat) : null;
    const motherboardDimensions = motherboardFormat ? setDimensions(motherboardFormat, motherboardPositionSize, caseFormat) : null;
    const aioDimensions = aioFormat ? setDimensions(aioFormat, aioPositionSize, caseFormat) : null;
    const aircoolerDimensions = aircoolerFormat ? setDimensions(aircoolerFormat, aircoolerPositionSize, caseFormat) : null;
    const fansDimensions = fansFormat ? setDimensions(fansFormat, fansPositionSize, caseFormat) : null;

    // Draw components sequentially
    const componentsToDraw = [
        { dimensions: { x: 100, y: 100, size: 500 }, data: caseData, key: 'case' }, // case has hardcoded dimensions
        { dimensions: motherboardDimensions, data: motherboardData, key: 'motherboard' },
        { dimensions: aircoolerDimensions, data: aircoolerData, key: 'aircooler' },
        { dimensions: aioDimensions, data: aioData, key: 'aio' },
        { dimensions: fansDimensions, data: fansData, key: 'fans' },
        { dimensions: gpuDimensions, data: gpuData, key: 'gpu' }
    ];

    for (const component of componentsToDraw) {
        if (component.dimensions && component.data?.length > 0) {
            const imageUrl = getData(component.data, 'imageUrl');
            await drawComponent(imageUrl, component.dimensions.x, component.dimensions.y, component.dimensions.size);
        }
    }
});