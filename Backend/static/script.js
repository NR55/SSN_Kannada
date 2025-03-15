const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "black";  // Background black
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = "white";  // White drawing
ctx.lineWidth = 10;
let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mousemove", draw);

function draw(event) {
    if (!drawing) return;
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
}

function clearCanvas() {
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function sendData() {
    const imageData = canvas.toDataURL("image/png");
    const base64Data = imageData.split(",")[1];

    fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data })
    })
        .then(response => response.json())
        .then(data => document.getElementById("result").textContent = data.prediction)
        .catch(error => console.error("Error:", error));
}
