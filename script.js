// VIZUALIZER JAVASCRIPT
document.getElementById("submit-btn").addEventListener('click', async function () {
    const canvas = document.getElementById('configCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const response = await fetch('./positionSizeMappings.json');
    const positionSizeMappings = await response.json();

    const gpuPositionSize = positionSizeMappings.gpuPositionSize;
    const motherboardPositionSize = positionSizeMappings.motherboardPositionSize;
    const aioPositionSize = positionSizeMappings.aioPositionSize;
    const aircoolerPositionSize = positionSizeMappings.aircoolerPositionSize;
    const fansPositionSize = positionSizeMappings.fansPositionSize;

    
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
    console.log('Grouped Components:', groupedComponents);

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

    function drawComponent(imageUrl, xposition, yposition, size, filter, rotation) {
        console.log(`Drawing component with URL: ${imageUrl}, x: ${xposition}, y: ${yposition}, size: ${size}, filter: ${filter}, rotation: ${rotation}`);
        return new Promise((resolve) => {
            const image = new Image();
            image.crossOrigin = 'Anonymous';
    
            image.onload = () => {
                ctx.save();
                ctx.filter = filter;
    
                // Move to center of the image for rotation
                const centerX = xposition + size / 2;
                const centerY = yposition + size / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate(rotation * Math.PI / 180); // Convert degrees to radians
    
                // Draw the image centered at (0,0) after rotation
                ctx.drawImage(image, -size / 2, -size / 2, size, size);
    
                ctx.restore();
                resolve();
            };
    
            image.onerror = () => {
                console.warn(`Image not found: ${imageUrl}`);
                resolve();
            };
    
            image.src = `http://localhost:3000${imageUrl}`;
        });
    }    

    function setDimensions(format, positionSizeMapping, caseFormat, caseFanCapacity = null, caseType = null, fanCounter = null) {
        if (!positionSizeMapping || !format) {
            console.warn("Position size mapping or format is missing.");
            console.log("positionSizeMapping:", positionSizeMapping, "format:", format);
            return null;
        }
        if (!specialPositionsUrl) {
            console.warn("Special positions URL is not provided.");
            return null; // Return null if special positions URL is not available
        }

        const specialPositions = fetch(`http://localhost:3000${specialPositionsUrl}`)
            .then(res => res.json())
            .catch(error => {
                console.error(`Error fetching special positions:`, error);
                return null; // Return null for failed fetches
            });

        let dimensions = null;

        if (specialPositions[positionSizeMapping]) {
            if (positionSizeMapping === fansPositionSize) {
                if (fanCounter) {
                    dimensions = specialPositions[positionSizeMapping]?.[fanCounter]?.[format];
                    if (!dimensions) {
                        console.warn(`Format "${format}" not found in special positions for fan ${fanCounter}.`);
                    };
                } else {
                    console.warn("Fan counter is missing for fans in special positions.");
                };
            } else {
                dimensions = specialPositions[positionSizeMapping]?.[format];
                if (!dimensions) {
                    console.warn(`Format "${format}" not found in special positions for ${positionSizeMapping}.`);
                };
            };
        } else {
            if (positionSizeMapping === fansPositionSize) {
                if (caseFanCapacity && caseType && fanCounter) {
                    dimensions = positionSizeMapping?.[caseType]?.[caseFanCapacity]?.[fanCounter]?.[caseFormat]?.[format];
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
            }};

        return dimensions;
    }

    function getData(data, key) {
        if (Array.isArray(data) && data.length > 0) {
            return data[0][key]; // Access the key from the first object in the array
        }
        return null; // Return null if the array is empty or invalid
    }
    
    function aiofans(aioFanQuantity, aioFan, groupedComponents) {
        if (aioData && aioData.length > 0) { // Check if aioData is valid
            if( aioFanQuantity && aioFan) {
                if (!groupedComponents.fans) {
                    groupedComponents.fans = {};
                }   
                groupedComponents.fans[aioFan] = (groupedComponents.fans[aioFan] || 0) + aioFanQuantity;
            } else { 
                console.warn("AIO fan quantity or AIO fan is missing.");
            }
        } else {
            console.warn("AIO data is not available.");
            return null; // Return null if aio data is not available
        }
    }

    function specialPositions(key, specialPositionsUrl) {
        if (!specialPositionsUrl) {
            console.warn("Special positions URL is not provided.");
            return null; // Return null if special positions URL is not available
        }

        const specialPositions = fetch(`http://localhost:3000${specialPositionsUrl}`)
            .then(res => res.json())
            .catch(error => {
                console.error(`Error fetching special positions:`, error);
                return null; // Return null for failed fetches
            });
        
        if (!specialPositions) {
            if (specialPositions[key]) {
                return specialPositions[key]; // Return the specific key's special position
            }
            else {
                console.warn(`Special position not found for key: ${key}`);
                return null; // Return null if the key is not found
            }
    }};

    // Fetch data for each component type
    const [caseData, gpuData, motherboardData, aioData, aircoolerData] = await Promise.all([
        fetchData('case', groupedComponents['case'] || {}),
        fetchData('gpu', groupedComponents['gpu'] || {}),
        fetchData('motherboard', groupedComponents['motherboard'] || {}),
        fetchData('aio', groupedComponents['aio'] || {}),
        fetchData('aircooler', groupedComponents['aircooler'] || {}),
    ]);

    const aioFanQuantity = getData(aioData, 'aiofanQuantity'); 
    const aioFan = getData(aioData, 'aiofan');
    console.log('aioData:', aioData);
    aiofans(aioFanQuantity, aioFan, groupedComponents); // adds AIO fans

    // Fetch data for fans after aiofans is called
    const fansData = await fetchData('fans', groupedComponents['fans'] || {});
    console.log('fansData:', fansData);

    let fanQuantities = []; // Initialize fanQuantities array
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
    let fanFormats = []; // Initialize fanFormats array
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
        { dimensions: { x: 100, y: 100, size: 500 }, data: caseData, key: 'case', filter: 'none', rotation: 0 }, // case has hardcoded dimensions
        { dimensions: motherboardDimensions, data: motherboardData, key: 'motherboard', filter: 'brightness(0.9)', rotation: 0 },
        { dimensions: aircoolerDimensions, data: aircoolerData, key: 'aircooler', filter: 'none', rotation: 0 },
        { dimensions: aioDimensions, data: aioData, key: 'aio', filter: 'none', rotation: 0 },
    ];

    let fanCounter = 1; // Global counter for fan numbering

    // Add each fan to the componentsToDraw array
    fansData.forEach((fanData, index) => {
        const fanFormat = fanFormats[index];
        const fanQuantity = fanQuantities[index];

        if (fanFormat && fanData) {
            for (let i = 0; i < fanQuantity && i < caseFanCapacity; i++) {
                // Calculate dimensions for each fan based on fanCounter
                const fanDimension = setDimensions(fanFormat, fansPositionSize, caseFormat, caseFanCapacity, caseType, fanCounter // Pass fanCounter to determine unique placement
                );

                if (fanDimension) {
                    componentsToDraw.push({
                        dimensions: fanDimension,
                        data: fanData,
                        key: `fan${fanCounter}`, // Use the global counter for unique numbering
                        filter: 'brightness(0.6)',
                        rotation: fanDimension.rotation || 0, // Use rotation from fanData if available
                    });
                    fanCounter++; // Increment the global counter
                }
                else {
                    console.warn(`Fan dimensions not found for format: "${fanFormat}"`);
                }
            }
        }
    });

    console.log('componentsToDraw:', componentsToDraw);
    // add gpu last to be on top of the fans
    componentsToDraw.push({ dimensions: gpuDimensions, data: gpuData, key: 'gpu', filter: 'none' });

    // Wait for all components to be drawn
    for (const component of componentsToDraw) {
        const verticalGPU = document.getElementById('vertical-gpu').checked ? "yes" : "no";
            console.log('verticalGPU:', verticalGPU); 
        
        let imageUrl = ''; // Initialize imageUrl with a default value

        if (component.data) { // Ensure component.data exists
            // Check if component.dimensions.useImage2 is true or if verticalGPU is "yes" and it's the GPU
            if (component.dimensions?.image2 === "yes" || (verticalGPU === "yes" && component.key === 'gpu')) {
                let secondImage = getData(component.data, 'imageUrl2'); // Check if imageUrl2 is valid (I used a new name for the variable to avoid confusion)
                if (secondImage) {
                    imageUrl = secondImage; // Use imageUrl2 if valid
                } else if (component.data.imageUrl2) {
                    imageUrl = component.data.imageUrl2; // Fallback to imageUrl2
                } else if (component.data.imageUrl) {
                    imageUrl = component.data.imageUrl; // Fallback to imageUrl
                } else {
                    imageUrl = getData(component.data, 'imageUrl') || ''; // Fallback to another key or empty string
                }
            } else if (component.data.imageUrl) {
                imageUrl = component.data.imageUrl; // Use imageUrl if verticalGPU is not "yes"
            } else {
                imageUrl = getData(component.data, 'imageUrl') || ''; // Fallback to another key or empty string
            }
        }

        if (!imageUrl) {
            console.warn(`No valid imageUrl found for component: ${component.key}`);
        }

        if (component.dimensions && (Array.isArray(component.data) ? component.data.length > 0 : component.data)) {
            await drawComponent(
                imageUrl,
                component.dimensions.x,
                component.dimensions.y,
                component.dimensions.size,
                component.filter,
                component.rotation || 0
            );
        }
    }
});

// PAGE'S JAVASCRIPT
const selectedComponents = [];

document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            // Check if the checkbox is "verticalgpu"
            if (checkbox.id === "vertical-gpu") {
                // Custom behavior for "verticalgpu" (if needed)
                console.log('Vertical GPU checkbox selected');
                return; // Skip the reset logic for this checkbox
            }

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