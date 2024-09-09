document.getElementById("submit-btn").addEventListener('click', function() { 
    // Récupère les valeurs sélectionnées et les formatte
    const cpu = document.querySelector('#cpu > option:checked').value.toLowerCase().replace(/ /g, '-');
    const gpu = document.querySelector('#gpu > option:checked').value.toLowerCase().replace(/ /g, '-');
    const ram = document.querySelector('#ram > option:checked').value.toLowerCase().replace(/ /g, '-');
    const disqueDur = document.querySelector('#disque-dur > option:checked').value.toLowerCase().replace(/ /g, '-');
    
    // Effectue les requêtes pour récupérer les images des composants
    Promise.all([
        fetch(`http://localhost:3000/api/composants/cpu/${cpu}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/gpu/${gpu}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/ram/${ram}`).then(res => res.blob()),
        fetch(`http://localhost:3000/api/composants/disque-dur/${disqueDur}`).then(res => res.blob())
    ])
    .then(([cpuBlob, gpuBlob, ramBlob, disqueDurBlob]) => {
        const cpuUrl = URL.createObjectURL(cpuBlob);
        const gpuUrl = URL.createObjectURL(gpuBlob);
        const ramUrl = URL.createObjectURL(ramBlob);
        const disqueDurUrl = URL.createObjectURL(disqueDurBlob);

        const resultat = `
            <h2>Votre configuration PC</h2>
            <p>Processeur : ${cpu}</p>
            <img src="${cpuUrl}" alt="cpu" class="cpu">
            <br><hr>
            <p>Carte graphique : ${gpu}</p>
            <img src="${gpuUrl}" alt="gpu">
            <br><hr>
            <p>RAM : ${ram}</p>
            <img src="${ramUrl}" alt="RAM">
            <br><hr>
            <p>Disque dur : ${disqueDur}</p>
            <img src="${disqueDurUrl}" alt="Disque dur">
        `;
        
        document.getElementById("resultat").innerHTML = resultat;
    })
    .catch(error => console.error('Erreur lors de la récupération des images:', error));
});
    