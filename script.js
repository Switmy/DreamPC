document.getElementById("submit-btn").addEventListener('click', function() {
    const gpu = Array.from(
        document.querySelectorAll('input[name="gpu"]:checked')
    ).map(input => input.value.toLowerCase().replace(/ /g, '-'));
    const cooler = Array.from(
        document.querySelectorAll('input[name="cooler"]:checked')
    ).map(input => input.value.toLowerCase().replace(/ /g, '-'));
    const ram = Array.from(
        document.querySelectorAll('input[name="ram"]:checked')
    ).map(input => input.value.toLowerCase().replace(/ /g, '-'));
    const motherboard = Array.from(
        document.querySelectorAll('input[name="motherboard"]:checked')
    ).map(input => input.value.toLowerCase().replace(/ /g, '-'));
    const fans = Array.from(
        document.querySelectorAll('input[name="fans"]:checked')
    ).map(input => input.value.toLowerCase().replace(/ /g, '-'));
    const Case = Array.from(
        document.querySelectorAll('input[name="case"]:checked')
    ).map(input => input.value.toLowerCase().replace(/ /g, '-'));

    // Fetch and draw components one at a time
    const canvas = document.getElementById('configCanvas');
    const ctx = canvas.getContext('2d');

    function fetchAndDrawComponent(componentType, selectedValues, yOffset) {
        selectedValues.forEach((value, index) => {
            fetch(`http://localhost:3000/api/components/${componentType}/${value}`)
                .then(res => res.json())
                .then(({ imageUrl }) => {
                    const image = new Image();
                    image.onload = () => {
                        ctx.drawImage(image, index * 100 + 50, yOffset, 150, 150);
                    };
                    image.src = `http://localhost:3000${imageUrl}`;
                })
                .catch(error => console.error(`Error fetching ${componentType} (${value}):`, error));
        });
    }
    fetchAndDrawComponent('gpu', gpu, 50);
    fetchAndDrawComponent('cooler', cooler, 250);
    fetchAndDrawComponent('ram', ram, 450);
    fetchAndDrawComponent('motherboard', motherboard, 150);
    fetchAndDrawComponent('fans', fans, 300);
    fetchAndDrawComponent('case', Case, 500);
});

