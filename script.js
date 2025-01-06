document.getElementById("submit-btn").addEventListener('click', function() {
    const gpu = document.querySelector('#gpu > option:checked').value.toLowerCase().replace(/ /g, '-');
    const cooler = document.querySelector('#cooler > option:checked').value.toLowerCase().replace(/ /g, '-');
    const ram = document.querySelector('#ram > option:checked').value.toLowerCase().replace(/ /g, '-');
    const motherboard = document.querySelector('#motherboard > option:checked').value.toLowerCase().replace(/ /g, '-');
    const fans = document.querySelector('#fans > option:checked').value.toLowerCase().replace(/ /g, '-');
    const Case = document.querySelector('#case > option:checked').value.toLowerCase().replace(/ /g, '-');

    // Fetch and draw components one at a time
    const components = ['gpu', 'cooler', 'ram', 'motherboard', 'fans', 'case'];
    const canvas = document.getElementById('configCanvas');
    const ctx = canvas.getContext('2d');

    components.forEach((component, index) => {
    const selectedValue = document.querySelector(`#${component} > option:checked`).value
        .toLowerCase()
        .replace(/ /g, '-');

    fetch(`http://localhost:3000/api/components/${component}/${selectedValue}`)
        .then(res => res.json())
        .then(({ imageUrl, metadata }) => {
            const image = new Image();
            image.onload = () => {
                // Draw image on canvas (position is an example; adjust as needed)
                ctx.drawImage(image, index * 100 + 50, 50, 150, 150);

                // Log and optionally display metadata
                console.log(`${component} metadata:`, metadata);
                if (component === 'motherboard') {
                    const motherboardNameElement = document.getElementById('motherboardNameDisplay');
                    if (motherboardNameElement) {
                        motherboardNameElement.innerText = `Motherboard Name: ${metadata.name}`;
                    }
                }
            };
            image.src = `http://localhost:3000${imageUrl}`;
        })
        .catch(error => console.error(`Error fetching ${component}:`, error));
});

});
