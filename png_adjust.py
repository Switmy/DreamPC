import os
import cv2
import numpy as np
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, flash

app = Flask(__name__, template_folder='.')
app.config['UPLOAD_FOLDER'] = 'images/'  # Directory for processed images
app.config['BASE_IMAGES_FOLDER'] = 'base_images/'  # Directory for unprocessed images
app.secret_key = 'supersecretkey'

def center_and_fill_image(image, frame_size):
    frame_width, frame_height = frame_size

    if image.shape[2] == 4:
        alpha_channel = image[:, :, 3]
    else:
        alpha_channel = None

    if alpha_channel is not None:
        coords = cv2.findNonZero(alpha_channel)
        x, y, w, h = cv2.boundingRect(coords)
        image_cropped = image[y:y+h, x:x+w]
    else:
        image_cropped = image

    orig_height, orig_width = image_cropped.shape[:2]
    aspect_ratio_image = orig_width / orig_height
    aspect_ratio_frame = frame_width / frame_height

    if aspect_ratio_image > aspect_ratio_frame:
        new_width = frame_width
        new_height = int(frame_width / aspect_ratio_image)
    else:
        new_height = frame_height
        new_width = int(frame_height * aspect_ratio_image)

    resized_image = cv2.resize(image_cropped, (new_width, new_height), interpolation=cv2.INTER_AREA)

    if image.shape[2] == 4:
        new_image = np.zeros((frame_height, frame_width, 4), dtype=np.uint8)
        new_image[:, :] = (255, 255, 255, 0)
    else:
        new_image = np.zeros((frame_height, frame_width, 3), dtype=np.uint8)
        new_image[:, :] = (255, 255, 255)

    x_offset = (frame_width - new_width) // 2
    y_offset = (frame_height - new_height) // 2

    new_image[y_offset:y_offset + new_height, x_offset:x_offset + new_width] = resized_image

    return new_image

def process_image(file, new_name, output_dir):
    # Save the uploaded file to the base_images folder
    base_image_path = os.path.join(app.config['BASE_IMAGES_FOLDER'], file.filename)
    file.save(base_image_path)  # Save file to base_images folder

    # Read the image from the base_images folder
    img = cv2.imread(base_image_path, cv2.IMREAD_UNCHANGED)
    if img is not None:
        img_processed = center_and_fill_image(img, (800, 800))
        # Determine output filename and path
        if new_name:
            output_filename = f"{new_name}.png"
        else:
            output_filename = file.filename
        output_path = os.path.join(output_dir, output_filename)
        
        # Save the processed image to the output directory
        cv2.imwrite(output_path, img_processed)
        
        # Remove the original image from base_images folder
        try:
            os.remove(base_image_path)  # Remove the original file
        except PermissionError as e:
            flash(f"PermissionError: Unable to delete {base_image_path}. Please ensure the file is not open.")
            print(e)
            
        print(f"Saving file to: {base_image_path}")
        print(f"Processing file: {base_image_path}")
        print(f"Saving processed file to: {output_path}")

        return output_filename
    else:
        flash(f"Error: {base_image_path} could not be processed.")
        return None

@app.route('/', methods=['GET', 'POST'])
def upload_image():
    if request.method == 'POST':
        output_dir = app.config['UPLOAD_FOLDER']
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        if 'image' in request.files and request.files['image'].filename != '':
            file = request.files['image']
            new_name = request.form.get('new_name')
            processed_filename = process_image(file, new_name, output_dir)
            if processed_filename:
                flash(f"Image {processed_filename} successfully processed and saved!")
                return redirect(url_for('download_image', filename=processed_filename))
        
        elif 'folder' in request.files and request.files.getlist('folder'):
            new_name = request.form.get('new_name')
            files = request.files.getlist('folder')

            for file in files:
                if file.filename.lower().endswith('.png'):
                    processed_filename = process_image(file, new_name, output_dir)
            
            flash(f"All images successfully processed and saved in the {output_dir} folder!")
            return redirect(request.url)

        else:
            flash("No image or folder selected.")
            return redirect(request.url)

    return render_template('png_adjust.html')

@app.route('/download/<filename>')
def download_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
