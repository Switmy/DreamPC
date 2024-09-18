document.getElementById("submit-btn").addEventListener('click', function() { 
    const gpu = document.querySelector('#gpu > option:checked').value.toLowerCase().replace(/ /g, '-');
    const ram = document.querySelector('#ram > option:checked').value.toLowerCase().replace(/ /g, '-');
    const motherboard = document.querySelector('#motherboard > option:checked').value.toLowerCase().replace(/ /g, '-');

    // Fetch the components as images and motherboard as a type
    Promise.all([
        fetch(`http://localhost:3000/api/composants/gpu/${gpu}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/ram/${cooler}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/ram/${ram}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/motherboard/${motherboard}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/motherboard/${motherboard}`).then(res => res.json())  // Fetching motherboard data as JSON
    ])
    .then(([, gpuBlob, ramBlob, , motherboardblob, motherboardData]) => {
        const canvas = document.getElementById('configCanvas');
        const ctx = canvas.getContext('2d');
        
        const gpuImage = new Image();
        const ramImage = new Image();
        const motherboardImage = new Image

        // Log motherboard name
        //console.log("Motherboard Name:", motherboardData.name);  

        // Display the motherboard name in an element or use it elsewhere
        //const motherboardNameElement = document.getElementById('motherboardNameDisplay');
        //if (motherboardNameElement) {
            //motherboardNameElement.innerText = `Motherboard Name: ${motherboardData.name}`;
        //}

        // Once all images are loaded, draw them on the canvas
        Promise.all([
            new Promise((resolve) => { gpuImage.onload = resolve; gpuImage.src = URL.createObjectURL(gpuBlob); }),
            new Promise((resolve) => { ramImage.onload = resolve; ramImage.src = URL.createObjectURL(ramBlob); }),
            new Promise((resolve) => { motherboardImage.onload = resolve; motherboardImage.src = URL.createObjectURL(motherboardblob); })
        ])
        .then(() => {

            if (motherboardData.name.includes("atx")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for new drawing

            // Draw the CPU image at position (50, 50) and scale it
            ctx.drawImage(cpuImage, 50, 50, 150, 150);
            ctx.fillText("CPU", 50, 220);  // Label the component

            // Draw the GPU image at position (250, 50)
            ctx.drawImage(gpuImage, 250, 50, 150, 150);
            ctx.fillText("GPU", 250, 220);

            // Draw the RAM image at position (50, 300)
            ctx.drawImage(ramImage, 50, 300, 150, 150);
            ctx.fillText("RAM", 50, 470);

            // Draw the Disk image at position (250, 300)
            ctx.drawImage(disqueDurImage, 250, 300, 150, 150);
            ctx.fillText("Disque Dur", 250, 470);
            }
        });
    })
    .catch(error => console.error('Erreur lors de la récupération des images ou des données:', error));
});
