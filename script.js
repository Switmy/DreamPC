// VIZUALIZER JAVASCRIPT
document.getElementById("submit-btn").addEventListener('click', async function () {
    const canvas = document.getElementById('configCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!canvas || !ctx) {
        console.error("Canvas or context is not found.");
        return;
    }

    if (!('filter' in ctx)) {
        console.warn('Canvas filter is not supported in this browser.');
    }

    //const selectedColor = document.getElementById('favcolor').value;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Group selected components by their type and count occurrences
    const groupedComponents = selectedComponents.reduce((acc, component) => {
        const key = component.name;
        const value = component.value.toLowerCase().replace(/ /g, '-');

        if (!acc[key]) {
            acc[key] = {};
        }
        if (!acc[key][value]) {
            acc[key][value] = 0;
        }
        acc[key][value] += 1; // Increment count for duplicate components
        return acc;
    }, {});

    function fetchData(componentType, groupedValues) {
        const fetchPromises = [];

        // Handle duplicates only for 'fans'
        if (componentType === 'fans') {
            for (const [value, count] of Object.entries(groupedValues)) {
                for (let i = 0; i < count; i++) {
                    fetchPromises.push(
                        fetch(`http://localhost:3000/api/components/${componentType}/${value}`)
                            .then(res => res.json())
                            .catch(error => {
                                console.error(`Error fetching ${componentType} (${value}):`, error);
                                return null; // Return null for failed fetches
                            })
                    );
                }
            }
        } else {
            // For other components, fetch only once per unique value
            for (const value of Object.keys(groupedValues)) {
                fetchPromises.push(
                    fetch(`http://localhost:3000/api/components/${componentType}/${value}`)
                        .then(res => res.json())
                        .catch(error => {
                            console.error(`Error fetching ${componentType} (${value}):`, error);
                            return null; // Return null for failed fetches
                        })
                );
            }
        }

        return Promise.allSettled(fetchPromises).then(results =>
            results
                .filter(result => result.status === 'fulfilled' && result.value) // Filter out failed fetches
                .map(result => result.value)
        );
    }

    function drawComponent(imageUrl, xposition, yposition, size, filter) {
        console.log(`Drawing component with URL: ${imageUrl}, x: ${xposition}, y: ${yposition}, size: ${size}, filter: ${filter}`);
        return new Promise((resolve) => {
            const image = new Image();
            image.crossOrigin = 'Anonymous'; // Enable CORS for the image
            image.onload = () => {
                ctx.save(); // Save the current canvas state
                ctx.filter = filter; // Apply the filter
                ctx.drawImage(image, xposition, yposition, size, size); // Draw the image
                ctx.restore(); // Restore the canvas state
                resolve();
            };
            image.onerror = () => {
                console.warn(`Image not found: ${imageUrl}`);
                resolve(); // Skip this component
            };
            image.src = `http://localhost:3000${imageUrl}`; // Set the image source
        });
    }

    function setDimensions(format, positionSizeMapping, caseFormat, caseFanCapacity = null, caseType = null, fanCounter = null) {
        if (!positionSizeMapping || !format) {
            console.warn("Position size mapping or format is missing.");
            console.log("positionSizeMapping:", positionSizeMapping, "format:", format);
            return null;
        }

        let dimensions = null;

        if (positionSizeMapping === fansPositionSize) {
            // Special handling for fans
            if (caseFanCapacity && caseType && fanCounter) {
                dimensions = positionSizeMapping?.[fanCounter]?.[caseFanCapacity]?.[caseType]?.[caseFormat]?.[format];
                if (!dimensions) {
                    console.warn(`Format "${format}" not found in case mapping for fan ${fanCounter}.`);
                }
            } else {
                console.warn("Case fan capacity, case type, or fan counter is missing for fans.");
            }
        } else {
            // General case for other components
            dimensions = positionSizeMapping?.[caseFormat]?.[format];
            if (!dimensions) {
                console.warn(`Dimensions not found for caseFormat: "${caseFormat}" and format: "${format}".`);
            }
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
    1 : { 10 : { aquarium : {
            atx: { matx: { x: 100, y: 210, size: 110 }, mitx: { x: 100, y: 210, size: 100 }},
            matx: { matx: { x: 100, y: 210, size: 100 }, mitx: { x: 100, y: 210, size: 90 }},
            mitx: { matx: { x: 100, y: 210, size: 90 }, mitx: { x: 100, y: 210, size: 80 }},
            eatx: { matx: { x: 100, y: 210, size: 120 }, mitx: { x: 100, y: 210, size: 110 }} 
        },
        },
    }};

    // Fetch data for each component type
    const [caseData, gpuData, motherboardData, aioData, aircoolerData, fansData] = await Promise.all([
        fetchData('case', groupedComponents['case'] || {}),
        fetchData('gpu', groupedComponents['gpu'] || {}),
        fetchData('motherboard', groupedComponents['motherboard'] || {}),
        fetchData('aio', groupedComponents['aio'] || {}),
        fetchData('aircooler', groupedComponents['aircooler'] || {}),
        fetchData('fans', groupedComponents['fans'] || {}),
    ]);
    console.log('fansData:', fansData);

    fanQuantities = []; // Initialize fanQuantities array
    if (fansData.length > 0) {
        fanQuantities = fansData.map((fan) => fan?.quantity ? fan.quantity : null);
    }
    console.log('fanQuantities:', fanQuantities);

    // Set dimensions for each component
    const caseFormat = caseData?.length > 0 ? getData(caseData, 'format').toLowerCase() : null;
    const gpuFormat = gpuData?.length > 0 ? getData(gpuData, 'format').toLowerCase() : null;
    const motherboardFormat = motherboardData?.length > 0 ? getData(motherboardData, 'format').toLowerCase() : null;
    const aioFormat = aioData?.length > 0 ? getData(aioData, 'format').toLowerCase() : null;
    const aircoolerFormat = aircoolerData?.length > 0 ? getData(aircoolerData, 'format').toLowerCase() : null;
    fanFormats = []; // Initialize fanFormats array
    if (fansData.length > 0) {
        fanFormats = fansData.map((fan) => fan?.format ? fan.format.toLowerCase() : null);
    }
    console.log('fanFormats:', fanFormats);

    // Get the fan-cacacity ;) and case type from the case data
    const caseFanCapacity = caseData?.length > 0 ? getData(caseData, 'fancapacity') : null;
    const caseType = caseData?.length > 0 ? getData(caseData, 'casetype') : null;
    console.log('caseFanCapacity:', caseFanCapacity, ', caseType:', caseType);

    const gpuDimensions = gpuFormat ? setDimensions(gpuFormat, gpuPositionSize, caseFormat) : null;
    const motherboardDimensions = motherboardFormat ? setDimensions(motherboardFormat, motherboardPositionSize, caseFormat) : null;
    const aioDimensions = aioFormat ? setDimensions(aioFormat, aioPositionSize, caseFormat) : null;
    const aircoolerDimensions = aircoolerFormat ? setDimensions(aircoolerFormat, aircoolerPositionSize, caseFormat) : null;
    const fansDimensions = fanFormats.map((fanFormat) => {
        return fanFormat ? setDimensions(fanFormat, fansPositionSize, caseFormat, caseFanCapacity, caseType) : null;
    });
    console.log('fansDimensions:', fansDimensions);

    // Draw components sequentially
    const componentsToDraw = [
        { dimensions: { x: 100, y: 100, size: 500 }, data: caseData, key: 'case', filter: 'none' }, // case has hardcoded dimensions
        { dimensions: motherboardDimensions, data: motherboardData, key: 'motherboard', filter: 'brightness(0.9)' },
        { dimensions: aircoolerDimensions, data: aircoolerData, key: 'aircooler', filter: 'none' },
        { dimensions: aioDimensions, data: aioData, key: 'aio', filter: 'none' },
        { dimensions: gpuDimensions, data: gpuData, key: 'gpu', filter: 'none' }
    ];

    let fanCounter = 1; // Global counter for fan numbering

    // Add each fan to the componentsToDraw array
    fansData.forEach((fanData, index) => {
        const fanFormat = fanFormats[index];
        const fanQuantity = fanQuantities[index];

        if (fanFormat && fanData) {
            for (let i = 0; i < fanQuantity && i < caseFanCapacity; i++) {
                // Calculate dimensions for each fan based on fanCounter
                const fanDimension = setDimensions(
                    fanFormat,
                    fansPositionSize,
                    caseFormat,
                    caseFanCapacity,
                    caseType,
                    fanCounter // Pass fanCounter to determine unique placement
                );

                if (fanDimension) {
                    componentsToDraw.push({
                        dimensions: fanDimension,
                        data: fanData,
                        key: `fan${fanCounter}`, // Use the global counter for unique numbering
                        filter: 'none'
                    });
                    fanCounter++; // Increment the global counter
                }
            }
        }
    });
    console.log('componentsToDraw:', componentsToDraw);

    // Wait for all components to be drawn
    for (const component of componentsToDraw) {
        if (component.dimensions && (Array.isArray(component.data) ? component.data.length > 0 : component.data)) {
            let imageUrl = getData(component.data, 'imageUrl'); // Try to get the imageUrl
            if (!imageUrl) {
                imageUrl = component.data.imageUrl; // fan's imageUrl is not in an array SO i GOT TO WORKAROUND IT ;)
            }
            await drawComponent(
                imageUrl,
                component.dimensions.x,
                component.dimensions.y,
                component.dimensions.size,
                component.filter
            );
        }
    }
});

// PAGE'S JAVASCRIPT
const selectedComponents = [];

document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            selectedComponents.push({ name: checkbox.name, value: checkbox.value });

            const selectedList = document.getElementById('selected-components-list');
            const listItem = document.createElement('li');
            listItem.textContent = `${checkbox.name.toUpperCase()}: ${checkbox.value}`;
            selectedList.appendChild(listItem);

            // Reset the checkbox immediately
            checkbox.checked = false;
        }
    });
});