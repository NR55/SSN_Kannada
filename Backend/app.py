from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from PIL import Image, ImageOps
import io
import base64

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

model = tf.keras.models.load_model("./ml_model/cnn_model.h5")
label_classes = np.load("./ml_model/kannada_letters.npy")

def preprocess_image(image_data):
    """ Convert image to grayscale, invert colors, and resize for model input. """
    image = Image.open(io.BytesIO(image_data)).convert("L")  # Convert to grayscale
    image = ImageOps.invert(image)  # Invert colors
    image = image.resize((28, 28))  # Resize (Assuming 28x28 input for model)
    image_array = np.array(image) / 255.0  # Normalize
    image_array = image_array.reshape(1, 28, 28, 1)  # Model expects 4D input
    return image_array

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        image_data = base64.b64decode(data["image"])  # Decode Base64 image
        # Save image locally before processing
        # with open("received_image.png", "wb") as f:
        #     f.write(image_data)
        processed_image = preprocess_image(image_data)  # Preprocess
        prediction = model.predict(processed_image)
        predicted_label = label_classes[np.argmax(prediction)]  # Get class
        
        return jsonify({"prediction": predicted_label})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
