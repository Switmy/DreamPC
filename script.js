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
    const ram = getSelectedValues('ram');
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

    function setDimensions(format, positionSizeMapping) {
        if (!positionSizeMapping[format]) {
            console.warn(`Format "${format}" not found in positionSizeMapping.`);
            return null;
        }
        return positionSizeMapping[format];
    }

    function getData(data, key) {
        if (Array.isArray(data) && data.length > 0) {
            return data[0][key]; // Access the key from the first object in the array
        }
        return undefined; // Return undefined if the array is empty or invalid
    }

    const casePositionSize = {
        atx: { x: 100, y: 100, size: 500 },
        matx: { x: 100, y: 100, size: 400 },
        mitx: { x: 100, y: 100, size: 300 },
        eatx: { x: 100, y: 100, size: 600 }
    };

    const gpuPositionSize = {
        atx: { x: 150, y: 230, size: 330 },
        matx: { x: 150, y: 230, size: 280 },
        mitx: { x: 150, y: 230, size: 250 },
        eatx: { x: 150, y: 230, size: 380 }
    };

    const motherboardPositionSize = {
        atx: { x: 160, y: 190, size: 250 },
        matx: { x: 160, y: 190, size: 200 },
        mitx: { x: 160, y: 190, size: 150 },
        eatx: { x: 160, y: 190, size: 300 }
    };

    const aioPositionSize = {
        atx: { x: 230, y: 210, size: 110 },
        eatx: { x: 230, y: 210, size: 120 }
    };

    const aircoolerPositionSize = {
        atx: { x: 230, y: 210, size: 110 },
        matx: { x: 230, y: 210, size: 100 },
        mitx: { x: 230, y: 210, size: 90 },
        eatx: { x: 230, y: 210, size: 120 }
    };

    const fansPositionSize = {
        atx: { x: 100, y: 210, size: 120 },
        matx: { x: 100, y: 210, size: 110 },
        mitx: { x: 100, y: 210, size: 100 },
        eatx: { x: 100, y: 210, size: 130 }
    };

    // Fetch data for each component type
    const [caseData, gpuData, motherboardData, aioData, aircoolerData, fansData, ramData] = await Promise.all([
        fetchData('case', Case),
        fetchData('gpu', gpu),
        fetchData('motherboard', motherboard),
        fetchData('aio', aio),
        fetchData('aircooler', aircooler),
        fetchData('fans', fans),
        fetchData('ram', ram)
    ]);

    // Set dimensions for each component
    const caseFormat = caseData?.length > 0 ? getData(caseData, 'format').toLowerCase() : null;
    const gpuFormat = gpuData?.length > 0 ? getData(gpuData, 'format').toLowerCase() : null;
    const motherboardFormat = motherboardData?.length > 0 ? getData(motherboardData, 'format').toLowerCase() : null;
    const aioFormat = aioData?.length > 0 ? getData(aioData, 'format').toLowerCase() : null;
    const aircoolerFormat = aircoolerData?.length > 0 ? getData(aircoolerData, 'format').toLowerCase() : null;
    const fansFormat = fansData?.length > 0 ? getData(fansData, 'format').toLowerCase() : null;

    const caseDimensions = caseFormat ? setDimensions(caseFormat, casePositionSize) : null;
    const gpuDimensions = gpuFormat ? setDimensions(gpuFormat, gpuPositionSize) : null;
    const motherboardDimensions = motherboardFormat ? setDimensions(motherboardFormat, motherboardPositionSize) : null;
    const aioDimensions = aioFormat ? setDimensions(aioFormat, aioPositionSize) : null;
    const aircoolerDimensions = aircoolerFormat ? setDimensions(aircoolerFormat, aircoolerPositionSize) : null;
    const fansDimensions = fansFormat ? setDimensions(fansFormat, fansPositionSize) : null;

    // Draw components sequentially
    const componentsToDraw = [
        { dimensions: caseDimensions, data: caseData, key: 'case' },
        { dimensions: motherboardDimensions, data: motherboardData, key: 'motherboard' },
        { dimensions: { x: 290, y: 220, size: 110 }, data: ramData, key: 'ram' }, // RAM has hardcoded dimensions
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