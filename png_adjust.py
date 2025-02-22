import os
import cv2
import numpy as np
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, flash

app = Flask(__name__, template_folder='.')
app.config['UPLOAD_FOLDER'] = 'images/'  # Directory for processed images
app.secret_key = 'supersecretkey'

import cv2
import numpy as np

def center_and_fill_image(image, frame_size, black_and_white=True, brightness_boost = 1.3):
    #Set black_and_white=False to remove the black_and_white filter....
    #And set brightness_booOOOOOOOOOst = 1.0 to remove the brightness_booOOOOOOOOOst 
    #brightness_boost can be controlled with the 1.(...) number (higher is more boooooost)
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

    if black_and_white:
        resized_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2GRAY)
        #_, resized_image = cv2.threshold(resized_image, 127, 255, cv2.THRESH_BINARY)
        # Add a new dimension to the black and white image
        resized_image = np.expand_dims(resized_image, axis=-1)

    if brightness_boost != 1.0:
        resized_image = cv2.addWeighted(resized_image, brightness_boost, resized_image, 0, 0)
        resized_image = np.expand_dims(resized_image, axis=-1)

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
    # Save the uploaded file temporarily in memory
    img_array = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_UNCHANGED)

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
        
        print(f"Saved processed file to: {output_path}")

        return output_filename
    else:
        flash(f"Error: The image could not be processed.")
        return None

@app.route('/', methods=['GET', 'POST'])
def upload_image():
    if request.method == 'POST':
        output_dir = app.config['UPLOAD_FOLDER']
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Handling multiple image uploads
        if 'images' in request.files:
            files = request.files.getlist('images')
            new_name = request.form.get('new_name')
            processed_files = []

            for file in files:
                if file.filename.lower().endswith('.png'):
                    # Process each image with its original filename or new name
                    processed_filename = process_image(file, new_name, output_dir)
                    if processed_filename:
                        processed_files.append(processed_filename)
            
            if processed_files:
                flash(f"All images ({len(processed_files)}) successfully processed and saved in the {output_dir} folder!")
            else:
                flash("No valid images were processed.")
            return redirect(request.url)

        else:
            flash("No images selected.")
            return redirect(request.url)

    return render_template('png_adjust.html')

@app.route('/download/<filename>')
def download_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
