import tkinter as tk
import numpy as np
import tensorflow as tf
from PIL import Image, ImageOps
from tensorflow.keras.models import load_model
from sklearn.preprocessing import LabelEncoder

# Load trained CNN model
model = load_model("./T1/cnn_model.h5")  # Make sure xyz.h5 is in the same directory

# Initialize Tkinter window
window = tk.Tk()
window.title("Draw an Image")

canvas = tk.Canvas(window, width=280, height=280, bg="white")
canvas.pack()

# Create LabelEncoder (Ensure the same classes used during training)
label_encoder = LabelEncoder()
label_encoder.classes_ = np.load("./T1/label_classes.npy", allow_pickle=True)  # Save classes during training
# Load hardcoded labels
# label_encoder = LabelEncoder()
# label_encoder.classes_ = np.array([
#     0, 1, 2, 3, 4, 5, 6, 7, 8, 9,  # Digits
#     'a', 'aaa', 'e', 'eee', 'u', 'uuu', 'ru', 'ye', 'yeee', 'ai', 'o', 'ooo', 'oww', 'am', 'aha',
#     'ka', 'kha', 'ga', 'gha', '1_nya', 'ca', 'cha', 'ja', 'jha', '2_nya', 'ta', 'ttha', 'dda', 'ddha',
#     'nna', 'tha', 'thaa', 'da', 'dha', 'na', 'pa', 'pha', 'ba', 'bha', 'ma', 'ya', 'ra', 'la', 'va',
#     'shea', 'sa', 'ha', 'laa'
# ])

def predict(img):
    # Process the image and make prediction
    prediction = model.predict(img)
    predicted_class = np.argmax(prediction)  # Get class index
    class_label = label_encoder.classes_[predicted_class]  # Convert index to label
    
    result_label.config(text=f"Prediction: {class_label}")


# Function to draw on the canvas
def draw(event):
    x, y = event.x, event.y
    canvas.create_oval(x, y, x+10, y+10, fill="black", outline="black")

# Function to clear the canvas
def clear_canvas():
    canvas.delete("all")

# Function to predict the drawn image
def predict():
    # Save canvas drawing as an image
    canvas.postscript(file="drawing.eps")
    img = Image.open("drawing.eps").convert("L")  # Convert to grayscale
    img = img.resize((28, 28))  # Resize to model input size
    img = ImageOps.invert(img)  # Invert colors
    img = np.array(img)  # Convert to numpy array

    # Preprocessing: Normalize and reshape for CNN
    img = img / 255.0  # Normalize pixel values
    img = img.reshape(1, 28, 28, 1)  # Reshape for model input

    # Make prediction
    prediction = model.predict(img)
    predicted_class = np.argmax(prediction)
    class_label = label_encoder.inverse_transform([predicted_class])[0]  # Convert back to original label
    
    result_label.config(text=f"Prediction: {class_label}")

# UI Buttons
clear_button = tk.Button(window, text="Clear", command=clear_canvas)
clear_button.pack()

predict_button = tk.Button(window, text="Predict", command=predict)
predict_button.pack()

result_label = tk.Label(window, text="Draw and Predict!", font=("Arial", 16))
result_label.pack()

canvas.bind("<B1-Motion>", draw)  # Bind mouse movement to drawing
window.mainloop()
