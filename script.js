const selectedComponents = [];

async function drawVisualization() {
    console.log("🟢 [START] Drawing visualization...");

    const canvas = document.getElementById('configCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!canvas || !ctx) {
        console.error("❌ [ERROR] Canvas or context is not found.");
        return;
    }

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




    //! fetching data will later be handeled by the "fetch" script and passed to the Visualization function as parameters
    function fetchData(componentType, groupedValues) {
        console.log(`🌐 [FETCH] Fetching data for ${componentType}:`, groupedValues);
        const fetchPromises = [];

        // Handle duplicates only for 'fans'
        if (componentType === 'fans') {
            for (const [value, count] of Object.entries(groupedValues)) {
                for (let i = 0; i < count; i++) {
                    fetchPromises.push(
                        fetch(`http://localhost:3000/api/components/${value}`)
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
                    fetch(`http://localhost:3000/api/components/${value}`)
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
        if (caseData && caseData.length > 0) {
            const specialPositionsUrl = caseData?.length > 0 ? caseData[0].specialPositionsUrl : null;
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
                ctx.rotate((rotation * Math.PI) / 180); // Convert degrees to radians
                console.log(`🔄 [ROTATE] Rotating image by ${rotation} degrees at (${centerX}, ${centerY})`);

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




    



    function setDimensions(format, specialKey, specialPositions, fanCounter = null) {
        console.log("📏 [DIM] setDimensions called with:", { format, specialKey, specialPositions, fanCounter });
        if (!specialPositions || !format) {
            console.warn("⚠️ [WARN] Special positions or format is missing.");
            console.log("specialPositions:", specialPositions, "format:", format);
            return null;
        }

        console.log('🗺️ [DIM] specialPositions in setDimensions:', specialPositions);

        let dimensions = null;


        if (specialPositions[specialKey]) {
            if (specialKey === "fansPositionSize") {
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
                    console.warn(`⚠️ [WARN] Format "${format}" not found in special positions for ${specialKey}.`);
                }
            }
        } else {
            console.warn(`⚠️ [WARN] Special key "${specialKey}" not found in special positions.`);
        }


        console.log(`📐 [DIM] Dimensions for ${specialKey} with format "${format}":`, dimensions);
        return dimensions;
    }






    function getData(data, key) {
        console.log("🔑 [DATA] getData called with:", data, key);
        if (Array.isArray(data) && data.length > 0) {
            const obj = data[0];
            // Handle nested properties with dot notation (e.g., "specifications.fan_support_120")
            if (key.includes('.')) {
                return key.split('.').reduce((acc, part) => acc?.[part], obj);
            }
            // Direct access for top-level properties
            return obj[key];
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
    //!






    function applyRGB(color, aioDimensions, fansDimensions, rgbcomponents) {
        if (!color || !rgbcomponents) {
            console.warn("⚠️ [WARN] Missing crucial (color / rgbcompo.) parameters for applyRGB.");
            return;
        }
        console.log("🌈 [RGB] applyRGB called with:", { color, aioDimensions, fansDimensions, rgbcomponents });

        if (rgbcomponents.aiorgb && aioDimensions) {
            console.log("🎨 [AIO RGB] Applying AIO RGB");
            const centerX = aioDimensions.x + aioDimensions.size / 2;
            const centerY = aioDimensions.y + aioDimensions.size / 2;
            const radius = aioDimensions.size * 0.7; // Glow radius (adjust as needed)
            const gradient = ctx.createRadialGradient(
                centerX, centerY, radius * 0.2, // inner circle
                centerX, centerY, radius        // outer circle
            );
            gradient.addColorStop(0, `rgba(${color.red}, ${color.green}, ${color.blue}, 0.3)`);
            gradient.addColorStop(0.7, `rgba(${color.red}, ${color.green}, ${color.blue}, 0.05)`);
            gradient.addColorStop(1, `rgba(${color.red}, ${color.green}, ${color.blue}, 0)`);

            ctx.save();
            ctx.globalCompositeOperation = "lighter"; // Makes the glow effect more pronounced
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.restore();
        } 
        if (rgbcomponents.fanrgb && fansDimensions && fansDimensions.length > 0) {
            console.log("🎨 [FANS RGB] Applying Fans RGB");
            console.log("📏 [FANS RGB] fansDimensions:", fansDimensions);
            fansDimensions.forEach((fanDimension) => {
                const centerX = fanDimension.x + fanDimension.size / 2;
                const centerY = fanDimension.y + fanDimension.size / 2;
                const radius = fanDimension.size * 0.7; // Glow radius (adjust as needed)
                const hasImage2 = fanDimension.image2 === "yes";
                const rotation = fanDimension.rotation || 0;

                const gradient = ctx.createRadialGradient(
                    centerX, centerY, radius * 0.2,
                    centerX, centerY, radius
                );
                gradient.addColorStop(0, `rgba(${color.red}, ${color.green}, ${color.blue}, 0.3)`);
                gradient.addColorStop(0.7, `rgba(${color.red}, ${color.green}, ${color.blue}, 0.05)`);
                gradient.addColorStop(1, `rgba(${color.red}, ${color.green}, ${color.blue}, 0)`);

                ctx.save();
                ctx.globalCompositeOperation = "lighter";

                ctx.beginPath();
                if (hasImage2) {
                    // Full circle glow
                    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                } else {
                    // Half circle glow, rotated
                    ctx.translate(centerX, centerY);
                    ctx.rotate(((rotation - 90) * Math.PI) / 180); // degrees to rad, boss
                    ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2, false); // Top to bottom (half circle)
                    ctx.closePath();
                    ctx.translate(-centerX, -centerY); // Reset translation for fill
                }
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.restore();
            });
        }
    }


    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



    //! will be moved
    // Fetch data for each component type (except fans, which is handled separately)
    console.log("🚚 [FETCH] Fetching all component data...");
    const [caseData, gpuData, motherboardData, aioData, aircoolerData] = await Promise.all([
        fetchData('case', groupedComponents['case'] || {}),
        fetchData('gpu', groupedComponents['gpu'] || {}),
        fetchData('motherboard', groupedComponents['motherboard'] || {}),
        fetchData('aio', groupedComponents['aio'] || {}),
        fetchData('aircooler', groupedComponents['aircooler'] || {}),
    ]);
    console.log("📦 [FETCHED] All main component data:", { caseData, gpuData, motherboardData, aioData, aircoolerData });




    const aioFanQuantity = getData(aioData, 'specifications.aiofanQuantity');
    const aioFan = getData(aioData, 'specifications.aiofan');
    console.log('🌀 [AIO] aioData:', aioData);
    aiofans(aioFanQuantity, aioFan, groupedComponents); // adds AIO fans
    


    // Fetch data for fans after aiofans is called
    const fansData = await fetchData('fans', groupedComponents['fans'] || {});
    console.log('🧊 [FANS] fansData:', fansData);

    let fanQuantities = []; // Initialize fanQuantities array
    if (fansData.length > 0) {
        fanQuantities = fansData.map((fan) => fan?.specifications?.quantity ? fan.specifications.quantity : null);
    }
    console.log('🔢 [FANS] fanQuantities:', fanQuantities);




    // format for each component
    const caseFormat = caseData?.length > 0 ? getData(caseData, 'specifications.format')?.toLowerCase() : null;
    const motherboardFormat = motherboardData?.length > 0 ? getData(motherboardData, 'specifications.format')?.toLowerCase() : null;

    // *for these components, formats are approximaive categories based on the actual size, and the data is in the visualizer table instead of specifications, so we need to get it from there
    const gpuFormat = gpuData?.length > 0 ? getData(gpuData, 'visualizer.approximativeformat')?.toLowerCase() : null;
    const aioFormat = "atx";// aio's are always the same size, so we can hardcode it to atx
    const aircoolerFormat = aircoolerData?.length > 0 ? getData(aircoolerData, 'visualizer.approximativeformat')?.toLowerCase() : null;
    let fanFormats = []; // Initialize fanFormats array
    if (fansData.length > 0) {
        fanFormats = fansData.map((fan) => fan?.visualizer?.approximativeformat ? fan.visualizer.approximativeformat.toLowerCase() : null);
    }
    console.log('🔤 [FANS] fanFormats:', fanFormats);





    const specialPositions = (await fetchSpecialPositions(caseData))[0];
    console.log('🌟 [SPECIAL] Original specialPositions:', specialPositions);
    //!





    // Dimensions for each component
    const gpuDimensions = gpuFormat ? setDimensions(gpuFormat, "gpuPositionSize", specialPositions) : null;
    const motherboardDimensions = motherboardFormat ? setDimensions(motherboardFormat, "motherboardPositionSize", specialPositions) : null;
    const aioDimensions = aioFormat ? setDimensions(aioFormat, "aioPositionSize", specialPositions) : null;
    const aircoolerDimensions = aircoolerFormat ? setDimensions(aircoolerFormat, "aircoolerPositionSize", specialPositions) : null;







    // Draw components sequentially (except fans, which are drawn in a loop later)
    const componentsToDraw = [
        { dimensions: { x: 100, y: 100, size: 500 }, data: caseData, key: 'case', filter: 'none', rotation: 0 }, // case has hardcoded dimensions
        { dimensions: motherboardDimensions, data: motherboardData, key: 'motherboard', filter: 'brightness(0.9)', rotation: 0 },
        { dimensions: aircoolerDimensions, data: aircoolerData, key: 'aircooler', filter: 'none', rotation: 0 },
        { dimensions: aioDimensions, data: aioData, key: 'aio', filter: 'none', rotation: 0 },
    ];
    console.log('📝 [DRAW] motherboardDimensions:', motherboardDimensions);






    let fanCounter = 1; // Global counter for fan numbering
    const maxFanPositions = Object.keys(specialPositions.fansPositionSize).length;

    // Add each fan to the componentsToDraw array
    fansData.forEach((fanData, index) => {
        const fanFormat = fanFormats[index];
        const fanQuantity = fanQuantities[index];

        if (fanFormat && fanData) {
            for (let i = 0; i < fanQuantity && fanCounter <= maxFanPositions; i++) {
                // Calculate dimensions for each fan based on fanCounter
                const fanDimension = setDimensions(fanFormat, "fansPositionSize", specialPositions, fanCounter);

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



    // add gpu last to be on top of the fans (only if it has dimensions)
    if (gpuDimensions) {
        componentsToDraw.push({ dimensions: gpuDimensions, data: gpuData, key: 'gpu', filter: 'none' });
    } else {
        console.warn("⚠️ [WARN] GPU dimensions not found, GPU will not be drawn.");
    }


    console.log('🗂️ [DRAW] componentsToDraw:', componentsToDraw);
    








    // RGB glow handler
    const colorInputs = document.querySelectorAll('input[name="rgbcolor"]');
        colorInputs.forEach(input => {
        input.addEventListener("change", handleColorChange);
        });
    function handleColorChange() {
    // Get the checked radio button value
    const checkedInput = document.querySelector('input[name="rgbcolor"]:checked');
    console.log("🎛️ [RGB] handleColorChange triggered. Checked input:", checkedInput ? checkedInput.value : null);

    if (!checkedInput) {
        console.warn("⚠️ [RGB] No color selected. Skipping RGB glow.");
        return;
    }

    let colorHex;
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
        default:
            colorHex = "#ffffff";
            console.warn("⚠️ [RGB] Unknown color selected, defaulting to white.");
    }
    console.log("🎨 [RGB] Selected color hex:", colorHex);

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
    console.log("🎨 [RGB] Converted color object:", color);

    let fanrgb = null, gpurgb = null, aiorgb = null;
    if (fansData.length > 0) {
        fanrgb = fansData.map((fan) => fan?.specifications?.rgb ? fan.specifications.rgb : null);
        console.log("🔎 [RGB] fanrgb array:", fanrgb);
    }
    if (aioData.length > 0) {
        aiorgb = getData(aioData, 'specifications.rgb') || null;
        console.log("🔎 [RGB] aiorgb:", aiorgb);
    }


    // Get all fan positions for RGB!
    const fanComponents = componentsToDraw.filter(c => c.key && c.key.startsWith('fan'));
    const fansDimensions = fanComponents.map(fan => fan.dimensions);
    console.log("📏 [RGB] fansDimensions for RGB:", fansDimensions);

    // Use an object for rgbcomponents to match applyRGB logic
    const rgbcomponents = {};
    if (fanrgb && fanrgb.some(r => r !== null)) {
        rgbcomponents.fanrgb = fanrgb.filter(r => r !== null);
        console.log("✅ [RGB] fanrgb added to rgbcomponents:", rgbcomponents.fanrgb);
    }
    if (aiorgb !== null) {
        rgbcomponents.aiorgb = aiorgb;
        console.log("✅ [RGB] aiorgb added to rgbcomponents:", aiorgb);
    }

    console.log('🌈 [RGB] Final rgbcomponents object:', rgbcomponents);
    console.log('🎨 [RGB] Applying color:', color);

    applyRGB(color, aioDimensions || [], fansDimensions || [], rgbcomponents);

}






    // Wait for all components to be drawn
    for (const component of componentsToDraw) {
        const verticalGPU = document.getElementById('vertical-gpu').checked ? "yes" : "no";
        console.log('🧲 [GPU] verticalGPU:', verticalGPU);

        let imageUrl = ''; // Initialize imageUrl with a default value

        if (component.data) { // Ensure component.data exists
            // Determine if data is an array or single object
            const isArray = Array.isArray(component.data);
            const dataObj = isArray ? component.data[0] : component.data;

            // Check if component.dimensions.useImage2 is true or if verticalGPU is "yes" and it's the GPU
            if (component.dimensions?.image2 === "yes" || (verticalGPU === "yes" && component.key === 'gpu')) {
                if (dataObj?.imageUrl2) {
                    imageUrl = dataObj.imageUrl2; // Use imageUrl2 if valid
                } else if (dataObj?.imageUrl) {
                    imageUrl = dataObj.imageUrl; // Fallback to imageUrl
                }
            } else if (dataObj?.imageUrl) {
                imageUrl = dataObj.imageUrl; // Use imageUrl
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
    // it's here so the RGB glow is drawn on top of everything
    handleColorChange();

    console.log("🏁 [END] Drawing complete!");
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//! this will also be moved to another script, it's just here for testing purposes for now
// Checkbox listeners for component selection
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

            // Update UI
            const selectedList = document.getElementById('selected-components-list');
            const listItem = document.createElement('li');
            listItem.textContent = `${checkbox.name.toUpperCase()}: ${checkbox.value}`;
            selectedList.appendChild(listItem);

            // Reset the checkbox immediately
            checkbox.checked = false;

            // Redraw if a case is selected
            const caseSelected = selectedComponents.some(comp => comp.name === "case");
            if (caseSelected) {
                await drawVisualization();
            }
        }
    });
});

// Reset button listener
document.getElementById('reset-button').addEventListener('click', () => {
    console.log("🔄 [RESET] Resetting visualization...");

    selectedComponents.length = 0; // Clear the selected components array
    const canvas = document.getElementById('configCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Clear the selected components list in the UI
    const selectedList = document.getElementById('selected-components-list');
    if (selectedList) {
        selectedList.innerHTML = '';
    }
});

// Color radio button listeners for RGB glow
document.querySelectorAll('input[name="rgbcolor"]').forEach(input => {
    input.addEventListener('change', async () => {
        // Only redraw if a case is selected (to avoid errors)
        const caseSelected = selectedComponents.some(comp => comp.name === "case");
        if (caseSelected) {
            await drawVisualization();
        }
    });
});