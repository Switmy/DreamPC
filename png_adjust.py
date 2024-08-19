import cv2
import numpy as np
import os

def center_and_fill_image(image, frame_size):
    """ Center and fill a PNG image within a rectangular frame. """
    frame_width, frame_height = frame_size

    # Get the alpha channel if it exists
    if image.shape[2] == 4:
        alpha_channel = image[:, :, 3]
    else:
        alpha_channel = None

    # Find the bounding box of the non-transparent part
    if alpha_channel is not None:
        coords = cv2.findNonZero(alpha_channel)
        x, y, w, h = cv2.boundingRect(coords)
        image_cropped = image[y:y+h, x:x+w]
    else:
        image_cropped = image

    orig_height, orig_width = image_cropped.shape[:2]
    aspect_ratio_image = orig_width / orig_height
    aspect_ratio_frame = frame_width / frame_height

    # Calculate new dimensions for the image to fit within the frame
    if aspect_ratio_image > aspect_ratio_frame:
        new_width = frame_width
        new_height = int(frame_width / aspect_ratio_image)
    else:
        new_height = frame_height
        new_width = int(frame_height * aspect_ratio_image)

    # Resize the image to fit within the frame while maintaining aspect ratio
    resized_image = cv2.resize(image_cropped, (new_width, new_height), interpolation=cv2.INTER_AREA)

    # Create a new image with the frame size and a transparent (or white) background
    if image.shape[2] == 4:
        # PNG with alpha channel
        new_image = np.zeros((frame_height, frame_width, 4), dtype=np.uint8)
        new_image[:, :] = (255, 255, 255, 0)  # Transparent background
    else:
        # PNG without alpha channel
        new_image = np.zeros((frame_height, frame_width, 3), dtype=np.uint8)
        new_image[:, :] = (255, 255, 255)  # White background

    # Compute the position where the resized image will be placed
    x_offset = (frame_width - new_width) // 2
    y_offset = (frame_height - new_height) // 2

    # Place the resized image in the center of the new image
    new_image[y_offset:y_offset + new_height, x_offset:x_offset + new_width] = resized_image

    return new_image

def main():
    frame_size = (300, 300)  # Desired dimensions for all images
    background_path = "matx_motherboard.png"
    overlay_paths = [
        "air_cooler.png",
        "water_cooler.png",
        "ram1.png",
        "ram2.png",
        "ram3.png",
        "ram4.png"
    ]

    # Load and process the background image
    background = cv2.imread(background_path, cv2.IMREAD_UNCHANGED)
    if background is not None:
        background = center_and_fill_image(background, frame_size)
        cv2.imwrite(background_path, background)
        print(f"Centered background image saved as {background_path}.")
    else:
        print(f"Error: {background_path} not found.")

    # Process each overlay
    for overlay_path in overlay_paths:
        overlay = cv2.imread(overlay_path, cv2.IMREAD_UNCHANGED)
        if overlay is not None:
            processed_overlay = center_and_fill_image(overlay, frame_size)
            cv2.imwrite(overlay_path, processed_overlay)
            print(f"Centered overlay saved as {overlay_path}.")
        else:
            print(f"Error: {overlay_path} not found.")

if __name__ == '__main__':
    main()
