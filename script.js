document.getElementById("submit-btn").addEventListener('click', function() { 
    const cpu = document.querySelector('#cpu > option:checked').value.toLowerCase().replace(/ /g, '-');
    const gpu = document.querySelector('#gpu > option:checked').value.toLowerCase().replace(/ /g, '-');
    const ram = document.querySelector('#ram > option:checked').value.toLowerCase().replace(/ /g, '-');
    const disqueDur = document.querySelector('#disque-dur > option:checked').value.toLowerCase().replace(/ /g, '-');
    
    Promise.all([
        fetch(`http://localhost:3000/api/composants/cpu/${cpu}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/gpu/${gpu}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/ram/${ram}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/disque-dur/${disqueDur}`).then(res => res.blob())
    ])
    .then(([cpuBlob, gpuBlob, ramBlob, disqueDurBlob]) => {
        const canvas = document.getElementById('configCanvas');
        const ctx = canvas.getContext('2d');
        
        const cpuImage = new Image();
        const gpuImage = new Image();
        const ramImage = new Image();
        const disqueDurImage = new Image();

        // Once all images are loaded, draw them on the canvas
        Promise.all([
            new Promise((resolve) => { cpuImage.onload = resolve; cpuImage.src = URL.createObjectURL(cpuBlob); }),
            new Promise((resolve) => { gpuImage.onload = resolve; gpuImage.src = URL.createObjectURL(gpuBlob); }),
            new Promise((resolve) => { ramImage.onload = resolve; ramImage.src = URL.createObjectURL(ramBlob); }),
            new Promise((resolve) => { disqueDurImage.onload = resolve; disqueDurImage.src = URL.createObjectURL(disqueDurBlob); })
        ])
        .then(() => {
            // to change ( "nigga" should be atx, itx,..... or other)
            if (cpu.includes("nigga"))

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
        });
    })
    .catch(error => console.error('Erreur lors de la récupération des images:', error));
});
