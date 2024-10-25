document.getElementById("submit-btn").addEventListener('click', function() { 
    const gpu = document.querySelector('#gpu > option:checked').value.toLowerCase().replace(/ /g, '-');
    const cooler = document.querySelector('#cooler > option:checked').value.toLowerCase().replace(/ /g, '-');
    const ram = document.querySelector('#ram > option:checked').value.toLowerCase().replace(/ /g, '-');
    const motherboard = document.querySelector('#motherboard > option:checked').value.toLowerCase().replace(/ /g, '-');
    const fans = document.querySelector('#fans > option:checked').value.toLowerCase().replace(/ /g, '-');
    const Case = document.querySelector('#case > option:checked').value.toLowerCase().replace(/ /g, '-');

    // Fetch the components as images and motherboard as a type
    Promise.all([
        fetch(`http://localhost:3000/api/composants/gpu/${gpu}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/cooler/${cooler}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/ram/${ram}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/motherboard/${motherboard}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/motherboard/${motherboard}`).then(res => res.json()),  // Fetching motherboard data as JSON
        fetch(`http://localhost:3000/api/composants/fans/${fans}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/case/${Case}`).then(res => res.blob()),
    ])
    .then(([gpuBlob, coolerBlob, ramBlob, motherboardblob, motherboardData, fansBlob, CaseBlob]) => {
        const canvas = document.getElementById('configCanvas');
        const ctx = canvas.getContext('2d');
        
        const gpuImage = new Image();
        const coolerImage = new Image();
        const ramImage = new Image();
        const motherboardImage = new Image();
        const fansImage = new Image();
        const CaseImage = new Image();
        
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
            new Promise((resolve) => { coolerImage.onload = resolve; coolerImage.src = URL.createObjectURL(coolerBlob); }),
            new Promise((resolve) => { ramImage.onload = resolve; ramImage.src = URL.createObjectURL(ramBlob); }),
            new Promise((resolve) => { motherboardImage.onload = resolve; motherboardImage.src = URL.createObjectURL(motherboardblob); }),
            new Promise((resolve) => { fansImage.onload = resolve; fansImage.src = URL.createObjectURL(fansBlob); }),
            new Promise((resolve) => { CaseImage.onload = resolve; CaseImage.src = URL.createObjectURL(CaseBlob); })
        ])
        .then(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for new drawing

            if (motherboardData.value.includes("atx")) {
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
