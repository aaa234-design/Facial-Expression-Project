import sys

# Keep DeepFace's console output safe on Windows terminals that cannot encode emojis.
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(errors="replace")

from flask import Flask, render_template, request, jsonify
from deepface import DeepFace
import cv2
import numpy as np
import base64

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


def analyze_image(image):
    results = DeepFace.analyze(
        img_path=image,
        actions=["emotion"],
        detector_backend="opencv",
        enforce_detection=False,
        silent=True
    )

    if isinstance(results, dict):
        results = [results]

    output = []

    for face in results:
        emotion_scores = face.get("emotion", {})
        dominant = face.get("dominant_emotion", "neutral")
        region = face.get("region", {})

        x = int(region.get("x", 0))
        y = int(region.get("y", 0))
        w = int(region.get("w", 0))
        h = int(region.get("h", 0))
        confidence = float(emotion_scores.get(dominant, 0))

        if w > 0 and h > 0:
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(
                image,
                f"{dominant.upper()} {confidence:.1f}%",
                (x, max(y - 10, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

        output.append({
            "expression": dominant,
            "confidence": round(confidence, 2),
            "emotions": {
                key: round(float(value), 2)
                for key, value in emotion_scores.items()
            }
        })

    return output, image


def encode_image(image):
    success, buffer = cv2.imencode(".jpg", image)
    if not success:
        raise ValueError("Image encoding failed")
    return base64.b64encode(buffer).decode("utf-8")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/upload", methods=["POST"])
def upload():
    if "image" not in request.files:
        return jsonify({"error": "Please select an image"}), 400

    file = request.files["image"]

    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        return jsonify({"error": "Only JPG and PNG images are allowed"}), 400

    try:
        file_bytes = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({"error": "Invalid image"}), 400

        results, annotated = analyze_image(image)

        return jsonify({
            "faces": results,
            "count": len(results),
            "image": encode_image(annotated)
        })

    except Exception as error:
        app.logger.exception("Image upload analysis failed")
        return jsonify({"error": str(error)}), 500


@app.route("/analyze_frame", methods=["POST"])
def analyze_frame():
    try:
        data = request.get_json(silent=True) or {}
        image_data = data.get("image", "")

        if "," not in image_data:
            return jsonify({"error": "Invalid camera frame"}), 400

        decoded = base64.b64decode(image_data.split(",", 1)[1])
        image_array = np.frombuffer(decoded, np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({"error": "Invalid camera frame"}), 400

        results, annotated = analyze_image(image)

        return jsonify({
            "faces": results,
            "count": len(results),
            "image": encode_image(annotated)
        })

    except Exception as error:
        app.logger.exception("Camera frame analysis failed")
        return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
