import cv2
import numpy as np
import os

exec(open('png_adjust.py').read())

def resize_image(image, new_size):
    return cv2.resize(image, new_size, interpolation=cv2.INTER_AREA)

def overlayer(img, img_overlay, pos, alpha_mask):
    x, y = pos

    # Define image and overlay ranges
    y1, y2 = max(0, y), min(img.shape[0], y + img_overlay.shape[0])
    x1, x2 = max(0, x), min(img.shape[1], x + img_overlay.shape[1])
    y1o, y2o = max(0, -y), min(img_overlay.shape[0], img.shape[0] - y)
    x1o, x2o = max(0, -x), min(img_overlay.shape[1], img.shape[1] - x)

    # Exit if nothing to overlay
    if y1 >= y2 or x1 >= x2 or y1o >= y2o or x1o >= x2o:
        return img

    # Perform the blend
    img_crop = img[y1:y2, x1:x2]
    img_overlay_crop = img_overlay[y1o:y2o, x1o:x2o]
    alpha = alpha_mask[y1o:y2o, x1o:x2o] / 255.0

    img_crop[:] = alpha[..., None] * img_overlay_crop + (1 - alpha[..., None]) * img_crop
    return img

def detect_motherboard_type(filename):
    # Extract the type from the filename (assumes format like 'atx_motherboard.png')
    basename = os.path.basename(filename).lower()
    if 'atx' in basename and 'eatx' not in basename and 'matx' not in basename:
        return 'ATX'
    elif 'matx' in basename:
        return 'MATX'
    elif 'itx' in basename:
        return 'ITX'
    elif 'eatx' in basename:
        return 'EATX'
    else:
        return 'Unknown'

def find_motherboard_image(directory):
    for filename in os.listdir(directory):
        if filename.lower().endswith('_motherboard.png'):
            return os.path.join(directory, filename)
    return None

# Define positions and sizes for different motherboard types
component_positions = {
    'MATX': [
        ("air_cooler.png", (70, 30), (155, 145)),
        ("water_cooler.png", (100, 45), (120, 120)),
        ("ram1.png", (200, 30), (85, 170)),
        ("ram2.png", (220, 30), (85, 170)),
        ("ram3.png", (190, 30), (85, 170)),
        ("ram4.png", (210, 30), (85, 170))
    ],
    'ATX': [
        ("air_cooler.png", (95, 35), (125, 115)),
        ("water_cooler.png", (110, 45), (100, 100)),
        ("ram1.png", (190, 35), (65, 130)),
        ("ram2.png", (210, 35), (65, 130)),
        ("ram3.png", (180, 35), (65, 130)),
        ("ram4.png", (200, 35), (65, 130))
    ],
    'EATX': [
        ("air_cooler.png", (120, 70), (195, 185)),
        ("water_cooler.png", (300, 180), (140, 140)),
        ("ram1.png", (280, 70), (105, 190)),
        ("ram2.png", (300, 70), (105, 190)),
        ("ram3.png", (270, 70), (105, 190)),
        ("ram4.png", (290, 70), (105, 190))
    ],
    'ITX': [
        ("air_cooler.png", (50, 20), (135, 125)),
        ("water_cooler.png", (150, 120), (80, 80)),
        ("ram1.png", (150, 20), (75, 160)),
        ("ram2.png", (170, 20), (75, 160)),
        ("ram3.png", (140, 20), (75, 160)),
        ("ram4.png", (160, 20), (75, 160))
    ]
}

if __name__ == '__main__':
    # Get the directory containing the images
    directory = os.path.dirname(os.path.abspath(__file__))

    # Find the motherboard image in the directory
    motherboard_image_path = find_motherboard_image(directory)
    if not motherboard_image_path:
        print("Error: No motherboard image found in the directory.")
        exit()

    print(f"Found motherboard image: {motherboard_image_path}")
    
    background = cv2.imread(motherboard_image_path)

    if background is not None:
        # Reduce luminosity by 20%
        alpha = 0.8  # Reduces luminosity by 20%
        background = cv2.convertScaleAbs(background, alpha=alpha)

        # Detect motherboard type based on filename
        motherboard_type = detect_motherboard_type(motherboard_image_path)
        print(f"Detected motherboard type: {motherboard_type}")

        if motherboard_type == 'Unknown':
            print("Error: Unknown motherboard type. Please check the filename format.")
        else:
            # Define the desired dimensions for the background image
            background_size = (300, 300)
            background = resize_image(background, background_size)

            # List of overlays & their positions & sizes for the detected motherboard type
            overlays = component_positions[motherboard_type]

            ignore_if_missing = {"ram2.png", "ram3.png", "ram4.png", "water_cooler.png", "air_cooler.png"}

            for overlay_path, position, size in overlays:
                overlay = cv2.imread(overlay_path, -1)  # Load with alpha channel

                if overlay is None:
                    if overlay_path in ignore_if_missing:
                        continue
                    print(f"Error: {overlay_path} not found.")
                    continue

                # Resize the overlay
                overlay = resize_image(overlay, size)

                # Separate overlay into color and alpha channels
                overlay_img = overlay[:, :, :3]
                overlay_alpha = overlay[:, :, 3]

                # Apply the overlay
                background = overlayer(background, overlay_img, position, overlay_alpha)

            # Save the result
            cv2.imwrite("output.png", background)
            print("Output image saved.")
    else:
        print("Error: Background image not found.")
