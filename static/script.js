const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const statusText = document.getElementById("status");
const resultsDiv = document.getElementById("results");
const resultImage = document.getElementById("resultImage");

let cameraStream = null;
let cameraTimer = null;
let busy = false;


function showResults(data) {
    resultsDiv.innerHTML = "";

    if (data.count === 0) {
        resultsDiv.textContent = "No face detected.";
        return;
    }

    data.faces.forEach((face, index) => {
        const card = document.createElement("div");
        card.className = "face-result";

        const heading = document.createElement("h3");
        heading.textContent =
            `Face ${index + 1}: ${face.expression.toUpperCase()}`;

        const confidence = document.createElement("p");
        confidence.className = "score";
        confidence.textContent = `Confidence: ${face.confidence}%`;

        card.appendChild(heading);
        card.appendChild(confidence);

        Object.entries(face.emotions).forEach(([name, value]) => {
            const line = document.createElement("p");
            line.textContent = `${name}: ${value.toFixed(2)}%`;
            card.appendChild(line);
        });

        resultsDiv.appendChild(card);
    });
}


function displayImage(data) {
    resultImage.innerHTML = "";

    const img = document.createElement("img");
    img.alt = "Image with detected facial expressions";
    img.src = "data:image/jpeg;base64," + data.image;

    resultImage.appendChild(img);
}


async function startCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = cameraStream;
        statusText.textContent = "Camera started.";

        if (cameraTimer) clearInterval(cameraTimer);
        cameraTimer = setInterval(analyzeFrame, 1500);
    } catch (error) {
        statusText.textContent = "Camera error: " + error.message;
    }
}


function stopCamera() {
    if (cameraTimer) {
        clearInterval(cameraTimer);
        cameraTimer = null;
    }

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    video.srcObject = null;
    statusText.textContent = "Camera stopped.";
}


async function analyzeFrame() {
    if (busy || !cameraStream || video.readyState < 2) return;

    busy = true;

    try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const image = canvas.toDataURL("image/jpeg", 0.7);

        const response = await fetch("/analyze_frame", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Analysis failed");
        }

        showResults(data);
        displayImage(data);
        statusText.textContent = `${data.count} face(s) analyzed`;
    } catch (error) {
        statusText.textContent = error.message;
    } finally {
        busy = false;
    }
}


async function uploadImage() {
    const input = document.getElementById("imageInput");

    if (!input.files.length) {
        alert("Please select an image first.");
        return;
    }

    const formData = new FormData();
    formData.append("image", input.files[0]);

    statusText.textContent = "Analyzing image...";

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Upload failed");
        }

        showResults(data);
        displayImage(data);
        statusText.textContent = `${data.count} face(s) detected`;
    } catch (error) {
        statusText.textContent = error.message;
    }
}


document.getElementById("startCamera")
    .addEventListener("click", startCamera);

document.getElementById("stopCamera")
    .addEventListener("click", stopCamera);

document.getElementById("uploadButton")
    .addEventListener("click", uploadImage);

window.addEventListener("beforeunload", stopCamera);
