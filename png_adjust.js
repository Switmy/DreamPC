const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const UPLOAD_FOLDER = path.join(__dirname, 'images');
const PORT = 4000;

// Ensure the upload folder exists
if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER);
}

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }));

// Function to center and fill the image
async function centerAndFillImage(buffer, frameSize) {
    const [frameWidth, frameHeight] = frameSize;

    let image = sharp(buffer).ensureAlpha();

    // Get metadata to calculate aspect ratios
    const metadata = await image.metadata();
    const origWidth = metadata.width;
    const origHeight = metadata.height;
    const aspectRatioImage = origWidth / origHeight;
    const aspectRatioFrame = frameWidth / frameHeight;

    let newWidth, newHeight;
    if (aspectRatioImage > aspectRatioFrame) {
        newWidth = frameWidth;
        newHeight = Math.round(frameWidth / aspectRatioImage);
    } else {
        newHeight = frameHeight;
        newWidth = Math.round(frameHeight * aspectRatioImage);
    }

    // Resize the image
    image = image.resize(newWidth, newHeight);

    // Convert to black and white
    image = image.grayscale();

    // Adjust brightness
    image = image.modulate({ brightness: 1.3 });

    // Create a transparent background and composite the resized image
    const background = sharp({
        create: {
            width: frameWidth,
            height: frameHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    });

    const xOffset = Math.floor((frameWidth - newWidth) / 2);
    const yOffset = Math.floor((frameHeight - newHeight) / 2);

    return background
        .composite([{ input: await image.toBuffer(), top: yOffset, left: xOffset }])
        .png()
        .toBuffer();
}

// Route to render the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'png_adjust.html'));
});

// Route to handle image uploads
app.post('/', upload.array('images'), async (req, res) => {
    const newName = req.body.new_name || '';
    const files = req.files;

    if (!files || files.length === 0) {
        return res.send('No images selected.');
    }

    const processedFiles = [];
    for (const file of files) {
        if (path.extname(file.originalname).toLowerCase() === '.png') {
            try {
                const processedBuffer = await centerAndFillImage(file.buffer, [800, 800]);
                const outputFilename = newName
                    ? `${newName}.png`
                    : file.originalname;
                const outputPath = path.join(UPLOAD_FOLDER, outputFilename);

                fs.writeFileSync(outputPath, processedBuffer);
                processedFiles.push(outputFilename);
            } catch (err) {
                console.error(`Error processing file ${file.originalname}:`, err);
            }
        }
    }

    if (processedFiles.length > 0) {
        res.send(`All images (${processedFiles.length}) successfully processed and saved in the ${UPLOAD_FOLDER} folder!`);
    } else {
        res.send('No valid images were processed.');
    }
});

// Route to download processed images
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_FOLDER, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});