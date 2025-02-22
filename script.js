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

    function fetchAndDrawComponent(componentType, selectedValues, xposition, yposition, xdimention, ydimention) {
        selectedValues.forEach((value, index) => {
            fetch(`http://localhost:3000/api/components/${componentType}/${value}`)
                .then(res => res.json())
                .then(({ imageUrl }) => {
                    const image = new Image();
                    image.onload = () => {
                        ctx.drawImage(image, xposition, yposition, xdimention, ydimention);
                    };
                    image.src = `http://localhost:3000${imageUrl}`;
                })
                .catch(error => console.error(`Error fetching ${componentType} (${value}):`, error));
        });
    }
    fetchAndDrawComponent('gpu', gpu, 100, 200, 150, 150);
    fetchAndDrawComponent('cooler', cooler, 100, 200, 30, 30);
    fetchAndDrawComponent('ram', ram, 100, 200, 90, 90);
    fetchAndDrawComponent('motherboard', motherboard, 100, 200, 200, 200);
    fetchAndDrawComponent('fans', fans, 100, 200, 90, 90);
    fetchAndDrawComponent('case', Case, 100, 200, 400, 400);
});

if (motherboard.some(mb => mb.includes("atx"))) {
    // Do something
}
