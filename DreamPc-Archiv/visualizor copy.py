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

    return img

def parse_positions_file(file_path):
    components = []

    with open(file_path, 'r') as file:
        lines = file.readlines()

    for line in lines:
        if ':' in line:
            component_name, data = line.split(':')
            component_name = component_name.strip()

            parts = data.split(',')
            filename = parts[0].strip()
            position = (int(parts[1]), int(parts[2]))
            size = (int(parts[3]), int(parts[4]))

            components.append((filename, position, size, component_name))

    return components

if __name__ == '__main__':
    # Get user inputs for component filenames
    motherboard_filename = input("Enter the motherboard image filename: ")
    gpu_filename = input("Enter the GPU image filename: ")
    fan1_filename = input("Enter the fan1 image filename: ")
    fan2_filename = input("Enter the fan2 image filename: ")
    fan3_filename = input("Enter the fan3 image filename: ")
    fan4_filename = input("Enter the fan4 image filename: ")

    # Create a dictionary to map component names to their corresponding filenames
    input_filenames = {
        'motherboard': motherboard_filename,
        'GPU': gpu_filename,
        'fan1': fan1_filename,
        'fan2': fan2_filename,
        'fan3': fan3_filename,
        'fan4': fan4_filename,
    }

    # Load the case (motherboard background) image
    case_img = cv2.imread("case.png", cv2.IMREAD_UNCHANGED)
    file_path = 'positions.txt'

    if case_img is not None:
        background_size = (300, 300)
        motherboard_img = resize_image(case_img, background_size)
        transparent_background = np.zeros((background_size[1], background_size[0], 4), dtype=np.uint8)

        # Overlay the motherboard image onto the transparent background
        transparent_background = overlayer(transparent_background, motherboard_img[:, :, :3], (0, 0), motherboard_img[:, :, 3])

        components = parse_positions_file(file_path)
        ignore_if_missing = {"ram2.png", "ram3.png", "ram4.png", "water_cooler.png", "air_cooler.png"}

        for default_filename, position, size, component_name in components:
            # Use the filename from the user input if available, otherwise use the default from the file
            overlay_path = input_filenames.get(component_name, default_filename)

            overlay = cv2.imread(overlay_path, -1)

            if overlay is None:
                if overlay_path in ignore_if_missing:
                    continue
                print(f"Error: {overlay_path} not found.")
                continue

            overlay = resize_image(overlay, size)
            overlay_img = overlay[:, :, :3]
            overlay_alpha = overlay[:, :, 3]
            transparent_background = overlayer(transparent_background, overlay_img, position, overlay_alpha)

        cv2.imwrite("output.png", transparent_background)
        print("Output image saved.")
    else:
        print("Error: Motherboard image not found.")
