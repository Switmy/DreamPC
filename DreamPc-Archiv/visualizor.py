import cv2
import numpy as np
import os

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

    # Blend the images
    for c in range(0, 3):
        img_crop[..., c] = alpha * img_overlay_crop[..., c] + (1 - alpha) * img_crop[..., c]

    # Update the alpha channel
    img_crop[..., 3] = (1 - (1 - alpha) * (1 - img_crop[..., 3]/255.0)) * 255

    return img

def parse_positions_file(file_path):
    # Define a dictionary to hold the categorized information
    data = {
        'motherboard': '',
        'fan': '',
        'Email': '',
        'Phone': ''
    }

    # Open and read the file
    with open(file_path, 'r') as file:
        lines = file.readlines()

    # Iterate through each line and extract information based on keywords
    for line in lines:
        if 'Name:' in line:
            data['Name'] = line.split(':')[-1].strip()
        elif 'Age:' in line:
            data['Age'] = line.split(':')[-1].strip()
        elif 'Email:' in line:
            data['Email'] = line.split(':')[-1].strip()
        elif 'Phone:' in line:
            data['Phone'] = line.split(':')[-1].strip()

    return data

if __name__ == '__main__':
    
    case_img = cv2.imread("case.png", cv2.IMREAD_UNCHANGED)
    file_path = 'positions.txt'

    if case_img is not None:
        # Define the desired dimensions for the background image
        background_size = (300, 300)
        motherboard_img = resize_image(case_img, background_size)

        # Create a transparent background
        transparent_background = np.zeros((background_size[1], background_size[0], 4), dtype=np.uint8)

        # Layer the motherboard image onto the transparent background
        transparent_background = overlayer(transparent_background, motherboard_img[:, :, :3], (0, 0), motherboard_img[:, :, 3])

        # List of overlays & their positions & sizes for the detected motherboard type
        overlays = parse_positions_file(file_path)

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
            transparent_background = overlayer(transparent_background, overlay_img, position, overlay_alpha)

        # Save the result
        cv2.imwrite("output.png", transparent_background)
        print("Output image saved.")
    else:
        print("Error: Motherboard image not found.")
