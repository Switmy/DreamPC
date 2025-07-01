const selectedComponents = [];

async function drawVisualization() {
    console.log("🟢 [START] Drawing visualization...");

    const canvas = document.getElementById('configCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!canvas || !ctx) {
        console.error("❌ [ERROR] Canvas or context is not found.");
        return;
    }

    const response = await fetch('./positionSizeMappings.json');
    const positionSizeMappings = await response.json();

    const gpuPositionSize = positionSizeMappings.gpuPositionSize;
    const motherboardPositionSize = positionSizeMappings.motherboardPositionSize;
    const aioPositionSize = positionSizeMappings.aioPositionSize;
    const aircoolerPositionSize = positionSizeMappings.aircoolerPositionSize;
    const fansPositionSize = positionSizeMappings.fansPositionSize;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Group selected components by their type and count occurrences
    const groupedComponents = selectedComponents.reduce((acc, component) => {
        const key = component.name;
        const value = component.value.toLowerCase().replace(/ /g, '-');
        if (!acc[key]) acc[key] = {};
        if (!acc[key][value]) acc[key][value] = 0;
        acc[key][value] += 1;
        return acc;
    }, {});
    console.log('📊 [GROUP] Grouped Components:', groupedComponents);

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function fetchData(componentType, groupedValues) {
        console.log(`🌐 [FETCH] Fetching data for ${componentType}:`, groupedValues);
        const fetchPromises = [];

        // Handle duplicates only for 'fans'
        if (componentType === 'fans') {
            for (const [value, count] of Object.entries(groupedValues)) {
                for (let i = 0; i < count; i++) {
                    fetchPromises.push(
                        fetch(`http://localhost:3000/api/components/${componentType}/${value}`)
                            .then(res => res.json())
                            .catch(error => {
                                console.error(`❌ [ERROR] Fetching ${componentType} (${value}):`, error);
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
                            console.error(`❌ [ERROR] Fetching ${componentType} (${value}):`, error);
                            return null; // Return null for failed fetches
                        })
                );
            }
        }

        return Promise.allSettled(fetchPromises).then(results => {
            console.log(`✅ [FETCHED] Results for ${componentType}:`, results);
            return results
                .filter(result => result.status === 'fulfilled' && result.value) // Filter out failed fetches
                .map(result => result.value);
        });
    }

    async function fetchSpecialPositions(caseData) {
        console.log("🔎 [SPECIAL] Fetching special positions for caseData:", caseData);
        if (caseData || caseData.length > 0) {
            const specialPositionsUrl = caseData?.length > 0 ? getData(caseData, 'specialPositionsUrl') : null;
            const fetchPromises = [];
            if (specialPositionsUrl !== "/special_positions/null" && specialPositionsUrl) {
                fetchPromises.push(
                    fetch(`http://localhost:3000${specialPositionsUrl}`)
                        .then(res => res.json())
                        .catch(error => {
                            console.error("❌ [ERROR] Fetching special positions:", error);
                            return null; // Return null for failed fetches
                        })
                );

                const results = await Promise.allSettled(fetchPromises);
                console.log("✅ [SPECIAL] Special positions fetched:", results);
                return results
                    .filter(result_1 => result_1.status === 'fulfilled' && result_1.value) // Filter out failed fetches
                    .map(result_2 => result_2.value);
            } else {
                console.warn("⚠️ [WARN] Special positions URL is not available in case data.");
                return Promise.resolve([]); // Return an empty array if special positions URL is not available
            }
        } else {
            console.warn("⚠️ [WARN] Case data is not available for fetching special positions.");
            return Promise.resolve([]); // Return an empty array if case data is not available
        }
    }

    function drawComponent(imageUrl, xposition, yposition, size, filter, rotation) {
        console.log(`🎨 [DRAW] Drawing component with URL: ${imageUrl}, x: ${xposition}, y: ${yposition}, size: ${size}, filter: ${filter}, rotation: ${rotation}`);
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
                console.log("✅ [DRAWN] Image drawn:", imageUrl);
                resolve();
            };

            image.onerror = () => {
                console.warn(`⚠️ [WARN] Image not found: ${imageUrl}`);
                resolve();
            };

            image.src = `http://localhost:3000${imageUrl}`;
        });
    }

    function setDimensions(format, positionSizeMapping, specialKey, specialPositions, caseFormat, caseFanCapacity = null, caseType = null, fanCounter = null) {
        console.log("📏 [DIM] setDimensions called with:", { format, positionSizeMapping, specialKey, specialPositions, caseFormat, caseFanCapacity, caseType, fanCounter });
        if (!positionSizeMapping || !format) {
            console.warn("⚠️ [WARN] Position size mapping or format is missing.");
            console.log("positionSizeMapping:", positionSizeMapping, "format:", format);
            return null;
        }

        if (!specialPositions) {
            console.warn("⚠️ [WARN] Special positions aren't provided.");
        }

        console.log('🗺️ [DIM] specialPositions in setDimensions:', specialPositions);

        let dimensions = null;

        if (specialPositions && specialPositions[specialKey]) {
            if (positionSizeMapping === fansPositionSize) {
                if (fanCounter) {
                    dimensions = specialPositions[specialKey]?.[fanCounter]?.[format];
                    if (!dimensions) {
                        console.warn(`⚠️ [WARN] Format "${format}" not found in special positions for fan ${fanCounter}.`);
                    }
                } else {
                    console.warn("⚠️ [WARN] Fan counter is missing for fans in special positions.");
                }
            } else {
                dimensions = specialPositions[specialKey]?.[format];
                if (!dimensions) {
                    console.warn(`⚠️ [WARN] Format "${format}" not found in special positions for ${positionSizeMapping}.`);
                }
            }
        } else {
            if (positionSizeMapping === fansPositionSize) {
                if (caseFanCapacity && caseType && fanCounter) {
                    dimensions = positionSizeMapping?.[caseType]?.[caseFanCapacity]?.[fanCounter]?.[caseFormat]?.[format];
                    if (!dimensions) {
                        console.warn(`⚠️ [WARN] Format "${format}" not found in case mapping for fan ${fanCounter}.`);
                    }
                } else {
                    console.warn("⚠️ [WARN] Case fan capacity, case type, or fan counter is missing for fans.");
                }
            } else {
                // General case for other components
                dimensions = positionSizeMapping?.[caseFormat]?.[format];
                if (!dimensions) {
                    console.warn(`⚠️ [WARN] Dimensions not found for caseFormat: "${caseFormat}" and format: "${format}".`);
                }
            }
        }

        console.log(`📐 [DIM] Dimensions for ${positionSizeMapping} with format "${format}":`, dimensions);
        return dimensions;
    }

    function getData(data, key) {
        console.log("🔑 [DATA] getData called with:", data, key);
        if (Array.isArray(data) && data.length > 0) {
            return data[0][key]; // Access the key from the first object in the array
        }
        return null; // Return null if the array is empty or invalid
    }

    function aiofans(aioFanQuantity, aioFan, groupedComponents) {
        console.log("🌀 [AIO] aiofans called with:", { aioFanQuantity, aioFan, groupedComponents });
        if (aioData && aioData.length > 0) { // Check if aioData is valid
            if (aioFanQuantity && aioFan) {
                if (!groupedComponents.fans) {
                    groupedComponents.fans = {};
                }
                groupedComponents.fans[aioFan] = (groupedComponents.fans[aioFan] || 0) + aioFanQuantity;
                console.log("➕ [AIO] Added AIO fans to groupedComponents:", groupedComponents.fans);
            } else {
                console.warn("⚠️ [WARN] AIO fan quantity or AIO fan is missing.");
            }
        } else {
            console.warn("⚠️ [WARN] AIO data is not available.");
            return null; // Return null if aio data is not available
        }
    }

    function applyRGB(color, gpuDimensions, aioDimensions, fansDimensions, rgbcomponents) {
        if (!color || !rgbcomponents) {
            console.warn("⚠️ [WARN] Missing crucial (color / rgbcompo.) parameters for applyRGB.");
            return;
        }
        console.log("🌈 [RGB] applyRGB called with:", { color, gpuDimensions, aioDimensions, fansDimensions, rgbcomponents });

        if (rgbcomponents.gpurgb && gpuDimensions) {
            console.log("🎨 [GPU RGB] Applying GPU RGB");
            ctx.fillStyle = `rgba(${color.red}, ${color.green}, ${color.blue}, 0.5)`;
            ctx.fillRect(gpuDimensions.x, gpuDimensions.y, gpuDimensions.size, gpuDimensions.size);
        }
        if (rgbcomponents.aiorgb && aioDimensions) {
            console.log("🎨 [AIO RGB] Applying AIO RGB");
            ctx.fillStyle = `rgba(${color.red}, ${color.green}, ${color.blue}, 0.5)`;
            ctx.fillRect(aioDimensions.x, aioDimensions.y, aioDimensions.size, aioDimensions.size);
        }
        if (rgbcomponents.fanrgb && fansDimensions && fansDimensions.length > 0) {
            console.log("🎨 [FANS RGB] Applying Fans RGB");
            fansDimensions.forEach((fanDimension) => {
                ctx.fillStyle = `rgba(${color.red}, ${color.green}, ${color.blue}, 0.5)`;
                ctx.fillRect(fanDimension.x, fanDimension.y, fanDimension.size, fanDimension.size);
            });
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Fetch data for each component type
    console.log("🚚 [FETCH] Fetching all component data...");
    const [caseData, gpuData, motherboardData, aioData, aircoolerData] = await Promise.all([
        fetchData('case', groupedComponents['case'] || {}),
        fetchData('gpu', groupedComponents['gpu'] || {}),
        fetchData('motherboard', groupedComponents['motherboard'] || {}),
        fetchData('aio', groupedComponents['aio'] || {}),
        fetchData('aircooler', groupedComponents['aircooler'] || {}),
    ]);
    console.log("📦 [FETCHED] All main component data:", { caseData, gpuData, motherboardData, aioData, aircoolerData });

    const aioFanQuantity = getData(aioData, 'aiofanQuantity');
    const aioFan = getData(aioData, 'aiofan');
    console.log('🌀 [AIO] aioData:', aioData);
    aiofans(aioFanQuantity, aioFan, groupedComponents); // adds AIO fans
    
    // Fetch data for fans after aiofans is called
    const fansData = await fetchData('fans', groupedComponents['fans'] || {});
    console.log('🧊 [FANS] fansData:', fansData);

    let fanQuantities = []; // Initialize fanQuantities array
    if (fansData.length > 0) {
        fanQuantities = fansData.map((fan) => fan?.quantity ? fan.quantity : null);
    }
    console.log('🔢 [FANS] fanQuantities:', fanQuantities);

    // format for each component
    const caseFormat = caseData?.length > 0 ? getData(caseData, 'format').toLowerCase() : null;
    const gpuFormat = gpuData?.length > 0 ? getData(gpuData, 'format').toLowerCase() : null;
    const motherboardFormat = motherboardData?.length > 0 ? getData(motherboardData, 'format').toLowerCase() : null;
    const aioFormat = aioData?.length > 0 ? getData(aioData, 'format').toLowerCase() : null;
    const aircoolerFormat = aircoolerData?.length > 0 ? getData(aircoolerData, 'format').toLowerCase() : null;
    let fanFormats = []; // Initialize fanFormats array
    if (fansData.length > 0) {
        fanFormats = fansData.map((fan) => fan?.format ? fan.format.toLowerCase() : null);
    }
    console.log('🔤 [FANS] fanFormats:', fanFormats);

    // Get the fan-cacacity ;) and case type from the case data
    const caseFanCapacity = caseData?.length > 0 ? getData(caseData, 'fancapacity') : null;
    const caseType = caseData?.length > 0 ? getData(caseData, 'casetype') : null;
    console.log('🏠 [CASE] caseFanCapacity:', caseFanCapacity, ', caseType:', caseType);

    const specialPositions = (await fetchSpecialPositions(caseData))[0];
    console.log('🌟 [SPECIAL] Original specialPositions:', specialPositions);

    const specialgpu = "gpuPositionSize";
    const specialmotherboard = "motherboardPositionSize";
    const specialaio = "aioPositionSize";
    const specialaircooler = "aircoolerPositionSize";
    const specialfans = "fansPositionSize";

    // diemensions for each component
    const gpuDimensions = gpuFormat ? setDimensions(gpuFormat, gpuPositionSize, specialgpu, specialPositions, caseFormat) : null;
    const motherboardDimensions = motherboardFormat ? setDimensions(motherboardFormat, motherboardPositionSize, specialmotherboard, specialPositions, caseFormat) : null;
    const aioDimensions = aioFormat ? setDimensions(aioFormat, aioPositionSize, specialaio, specialPositions, caseFormat) : null;
    const aircoolerDimensions = aircoolerFormat ? setDimensions(aircoolerFormat, aircoolerPositionSize, specialaircooler, specialPositions, caseFormat) : null;

    // Draw components sequentially
    const componentsToDraw = [
        { dimensions: { x: 100, y: 100, size: 500 }, data: caseData, key: 'case', filter: 'none', rotation: 0 }, // case has hardcoded dimensions
        { dimensions: motherboardDimensions, data: motherboardData, key: 'motherboard', filter: 'brightness(0.9)', rotation: 0 },
        { dimensions: aircoolerDimensions, data: aircoolerData, key: 'aircooler', filter: 'none', rotation: 0 },
        { dimensions: aioDimensions, data: aioData, key: 'aio', filter: 'none', rotation: 0 },
    ];
    console.log('📝 [DRAW] motherboardDimensions:', motherboardDimensions);

    let fanCounter = 1; // Global counter for fan numbering

    // Add each fan to the componentsToDraw array
    fansData.forEach((fanData, index) => {
        const fanFormat = fanFormats[index];
        const fanQuantity = fanQuantities[index];

        if (fanFormat && fanData) {
            for (let i = 0; i < fanQuantity && i < caseFanCapacity; i++) {
                // Calculate dimensions for each fan based on fanCounter
                const fanDimension = setDimensions(fanFormat, fansPositionSize, specialfans, specialPositions, caseFormat, caseFanCapacity, caseType, fanCounter // Pass fanCounter to determine unique placement
                );

                if (fanDimension) {
                    componentsToDraw.push({
                        dimensions: fanDimension,
                        data: fanData,
                        key: `fan${fanCounter}`, // Use the global counter for unique numbering
                        filter: 'brightness(0.6)',
                        rotation: fanDimension.rotation || 0, // Use rotation from fanData if available
                    });
                    console.log(`🧊 [FAN] Added fan${fanCounter} to componentsToDraw:`, fanDimension);
                    fanCounter++; // Increment the global counter
                }
                else {
                    console.warn(`⚠️ [WARN] Fan dimensions not found for format: "${fanFormat}", so it won't be added to [componentsToDraw].`);
                }
            }
        }
    });

    console.log('🗂️ [DRAW] componentsToDraw:', componentsToDraw);
    // add gpu last to be on top of the fans
    componentsToDraw.push({ dimensions: gpuDimensions, data: gpuData, key: 'gpu', filter: 'none' });


    // Update this selector to use the new radio button group
    const colorInputs = document.querySelectorAll('input[name="rgbcolor"]');
        colorInputs.forEach(input => {
        input.addEventListener("change", handleColorChange);
        });
    function handleColorChange() {
        // Get the checked radio button value
        const checkedInput = document.querySelector('input[name="rgbcolor"]:checked');
        let colorHex = "#ffffff"; // Default to white
        if (checkedInput) {
            switch (checkedInput.value) {
                case "red":
                    colorHex = "#ff0033";
                    break;
                case "green":
                    colorHex = "#00ff66";
                    break;
                case "blue":
                    colorHex = "#00ffff";
                    break;
                case "purple":
                    colorHex = "#9933ff";
                    break;
                case "white":
                    colorHex = "#ffffff";
                    break;
                case "orange":
                    colorHex = "#ff6600";
                    break;
                case "pink":
                    colorHex = "#ff66cc";
                    break;
            }
        }

        // Convert hex to RGB object for applyRGB
        function hexToRgb(hex) {
            hex = hex.replace(/^#/, "");
            if (hex.length === 3) {
                hex = hex.split("").map(x => x + x).join("");
            }
            const num = parseInt(hex, 16);
            return {
                red: (num >> 16) & 255,
                green: (num >> 8) & 255,
                blue: num & 255
            };
        }
        const color = hexToRgb(colorHex);

        let fanrgb = null, gpurgb = null, aiorgb = null;
        if (fansData.length > 0) {
            fanrgb = fansData.map((fan) => fan?.rgb ? fan.rgb : null);
        }
        if (gpuData.length > 0) {
            gpurgb = getData(gpuData, 'rgb') || null;
        }
        if (aioData.length > 0) {
            aiorgb = getData(aioData, 'rgb') || null;
        }

        // Get all fan positions!
        const fanComponents = componentsToDraw.filter(c => c.key && c.key.startsWith('fan'));
        const fansDimensions = fanComponents.map(fan => fan.dimensions);

        // Use an object for rgbcomponents to match applyRGB logic
        const rgbcomponents = { fanrgb, gpurgb, aiorgb };
        console.log('🌈 [RGB] rgbcomponents:', rgbcomponents);
        console.log('🎨 [RGB] Applying color:', color);

        applyRGB(color, gpuDimensions || [], aioDimensions || [], fansDimensions || [], rgbcomponents || []);
    }
    handleColorChange(); // Call the function to apply the initial color


    // Wait for all components to be drawn
    for (const component of componentsToDraw) {
        const verticalGPU = document.getElementById('vertical-gpu').checked ? "yes" : "no";
        console.log('🧲 [GPU] verticalGPU:', verticalGPU);

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
            console.warn(`⚠️ [WARN] No valid imageUrl found for component: ${component.key}`);
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
    console.log("🏁 [END] Drawing complete!");
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
        console.log("☑️ [CHECKBOX] Checkbox changed:", checkbox);
        if (checkbox.checked) {
            // Check if the checkbox is "verticalgpu"
            if (checkbox.id === "vertical-gpu") {
                console.log('🧲 [GPU] Vertical GPU checkbox selected');
                return;
            }

            // Check if the component is "fans" or not already selected
            if (checkbox.name === "fans" || !selectedComponents.some(comp => comp.name === checkbox.name)) {
                selectedComponents.push({ name: checkbox.name, value: checkbox.value });
                console.log("➕ [SELECT] Added to selectedComponents:", selectedComponents);

            } else {
                console.warn("⚠️ [WARN] Component already selected:", checkbox.name);
                return; // Prevent adding duplicates
            }

            const selectedList = document.getElementById('selected-components-list');
            const listItem = document.createElement('li');
            listItem.textContent = `${checkbox.name.toUpperCase()}: ${checkbox.value}`;
            selectedList.appendChild(listItem);

            // Reset the checkbox immediately
            checkbox.checked = false;

            const caseSelected = selectedComponents.some(
                comp => comp.name === "case"
            );
            if (caseSelected) {
                await drawVisualization();
            }
        }
    });
});

document.getElementById('reset-button').addEventListener('click', () => {
    console.log("🔄 [RESET] Resetting visualization...");

    selectedComponents.length = 0; // Clear the selected components array
    const canvas = document.getElementById('configCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // clear the selected components list in the UI
    const selectedList = document.getElementById('selected-components-list');
    if (selectedList) {
        selectedList.innerHTML = '';
    }
});