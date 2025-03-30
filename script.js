document.getElementById("submit-btn").addEventListener('click', function() {

    // Fetch and draw components one at a time
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

    function fetchAndDrawComponent(componentType, selectedValues, xposition, yposition, size) {
        const promises = selectedValues.map(value => {
            return new Promise((resolve, reject)=> {
            fetch(`http://localhost:3000/api/components/${componentType}/${value}`)
                .then(res => res.json())
                .then(({ imageUrl }) => {
                    const image = new Image();
                    image.onload = () => {
                        resolve({image, xposition, yposition, size});
                    };
                    image.onerror = reject;
                    image.src = `http://localhost:3000${imageUrl}`;
                })
                .catch(error => {console.error(`Error fetching ${componentType} (${value}):`, error); 
                reject(error);
            });
        });
    });
    return Promise.all(promises);
    }

    function setDimensions(component, formats) {
        const format = component.find(c => formats[c.format.toLowerCase()]);
        if (format) {
            return formats[format.format.toLowerCase()];
        }
        return null;
    }

    const caseFormats = {
        atx: { x: 100, y: 100, size: 500 },
        matx: { x: 100, y: 100, size: 400 },
        mitx: { x: 100, y: 100, size: 300 },
        eatx: { x: 100, y: 100, size: 600 }
    };

    const gpuFormats = {
        atx: { x: 150, y: 230, size: 330 },
        matx: { x: 150, y: 230, size: 280 },
        mitx: { x: 150, y: 230, size: 250 },
        eatx: { x: 150, y: 230, size: 380 }
    };

    const motherboardFormats = {
        atx: { x: 160, y: 190, size: 250 },
        matx: { x: 160, y: 190, size: 200 },
        mitx: { x: 160, y: 190, size: 150 },
        eatx: { x: 160, y: 190, size: 300 }
    };

    const aioFormats = {
        atx: { x: 230, y: 210, size: 110 },
        eatx: { x: 230, y: 210, size: 120 }
    };

    const aircoolerFormats = {
        atx: { x: 230, y: 210, size: 110 },
        matx: { x: 230, y: 210, size: 100 },
        mitx: { x: 230, y: 210, size: 90 },
        eatx: { x: 230, y: 210, size: 120 }
    };

    const fansFormats = {
        atx: { x: 100, y: 210, size: 120 },
        matx: { x: 100, y: 210, size: 110 },
        eatx: { x: 100, y: 210, size: 130 }
    };

    const caseDimensions = setDimensions(Case, caseFormats);
    const gpuDimensions = setDimensions(gpu, gpuFormats);
    const motherboardDimensions = setDimensions(motherboard, motherboardFormats);
    const aioDimensions = setDimensions(aio, aioFormats);
    const aircoolerDimensions = setDimensions(aircooler, aircoolerFormats);
    const fansDimensions = setDimensions(fans, fansFormats);

    // Call fetchAndDrawComponent() for each component and wait for all to finish
    Promise.all([
        fetchAndDrawComponent('case', Case, caseDimensions.x, caseDimensions.y, caseDimensions.size),
        fetchAndDrawComponent('motherboard', motherboard, motherboardDimensions.x, motherboardDimensions.y, motherboardDimensions.size),
        fetchAndDrawComponent('ram', ram, 290, 220, 110),
        fetchAndDrawComponent('aircooler', aircooler, aircoolerDimensions.x, aircoolerDimensions.y, aircoolerDimensions.size),
        fetchAndDrawComponent('aio', aio, aioDimensions.x, aioDimensions.y, aioDimensions.size),
        fetchAndDrawComponent('fans', fans, fansDimensions.x, fansDimensions.y, fansDimensions.size),
        fetchAndDrawComponent('gpu', gpu, gpuDimensions.x, gpuDimensions.y, gpuDimensions.size),
    ]).then(components => {
        components.flat().forEach(({ image, xposition, yposition, size }) => {
            ctx.drawImage(image, xposition, yposition, size, size);
        });
    }).catch(error => {
        console.error("Error drawing components:", error);
    });

});