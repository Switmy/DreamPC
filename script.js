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
    const cooler = getSelectedValues('cooler');
    const ram = getSelectedValues('ram');
    const motherboard = getSelectedValues('motherboard');
    const fans = getSelectedValues('fans');
    const Case = getSelectedValues('case'); 

    function getSelectedValues(name) {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
            .map(input => input.value.toLowerCase().replace(/ /g, '-'));
    }

    function fetchAndDrawComponent(componentType, selectedValues, xposition, yposition, xdimention, ydimention) {
        const promises = selectedValues.map(value => {
            return new Promise((resolve, reject)=> {
            fetch(`http://localhost:3000/api/components/${componentType}/${value}`)
                .then(res => res.json())
                .then(({ imageUrl }) => {
                    const image = new Image();
                    image.onload = () => {
                        resolve({image, xposition, yposition, xdimention, ydimention});
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

// Call fetchAndDrawComponent() for each component and wait for all to finish
Promise.all([
    fetchAndDrawComponent('case', Case, 100, 100, 500, 500),
    fetchAndDrawComponent('motherboard', motherboard, 160, 190, 250, 250),
    fetchAndDrawComponent('gpu', gpu, 150, 230, 330, 330),
    fetchAndDrawComponent('ram', ram, 290, 220, 110, 110),
    fetchAndDrawComponent('cooler', cooler, 230, 210, 110, 110),
    fetchAndDrawComponent('fans', fans, 100, 210, 120, 120),

]).then(components => {
    components.flat().forEach(({ image, xposition, yposition, xdimention, ydimention }) => {
        ctx.drawImage(image, xposition, yposition, xdimention, ydimention);
    });
}).catch(error => {
    console.error("Error drawing components:", error);
});

});

if (motherboard.some(mb => mb.includes("atx"))) {
    // Do something
}