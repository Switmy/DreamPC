import cv2
import numpy as np
import os
import argparse

def center_and_fill_image(image, frame_size):
    """Center and fill a PNG image within a rectangular frame."""
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

def process_image(img_path, frame_size, output_dir, new_name=None):
    """Load, process, and save the centered and filled image."""
    img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
    if img is not None:
        img = center_and_fill_image(img, frame_size)
        if new_name:
            output_path = os.path.join(output_dir, f"{new_name}.png")
        else:
            output_path = os.path.join(output_dir, os.path.basename(img_path))
        cv2.imwrite(output_path, img)
        print(f"Centered background image saved as {output_path}.")
    else:
        print(f"Error: {img_path} not found.")

def main():
    parser = argparse.ArgumentParser(description="Center and fill PNG images within a rectangular frame.")
    parser.add_argument("img_path", type=str, help="Path to a PNG image or a folder containing PNG images.")
    parser.add_argument("--new_name", type=str, help="New name for the output image (optional).")

    args = parser.parse_args()
    frame_size = (800, 800)
    img_path = args.img_path
    new_name = args.new_name

    # Determine the output directory
    if os.path.isfile(img_path):
        output_dir = os.path.join(os.path.dirname(img_path), "ADJUSTED_IMG")
    elif os.path.isdir(img_path):
        output_dir = os.path.join(img_path, "ADJUSTED_IMG")
    else:
        print("Error: img_path must be a .png file or a directory containing .png files.")
        return

    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    if os.path.isfile(img_path) and img_path.lower().endswith('.png'):
        process_image(img_path, frame_size, output_dir, new_name=new_name)
    elif os.path.isdir(img_path):
        for filename in os.listdir(img_path):
            if filename.lower().endswith('.png'):
                process_image(os.path.join(img_path, filename), frame_size, output_dir)
    else:
        print("Error: img_path must be a .png file or a directory containing .png files.")

if __name__ == '__main__':
    main()
