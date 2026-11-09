# AI Facial Expression Recognition

A Flask web application that analyzes visible facial expression patterns from a live webcam or an uploaded image using DeepFace and OpenCV.

## Features

- Live webcam frame analysis
- JPG and PNG image upload
- Multiple face analysis (as returned by the detector)
- Seven expression categories: angry, disgust, fear, happy, sad, surprise, and neutral
- Confidence scores and annotated image output

## Requirements

- Python 3.10 or 3.11 recommended
- Webcam for live camera mode
- Modern browser with camera permission enabled

## Setup

Create and activate a virtual environment:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS / Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the application:

```bash
python app.py
```

Open http://127.0.0.1:5000 in your browser.

DeepFace may download model weights the first time it runs. Camera access generally works on localhost; deployed sites should use HTTPS.

## Privacy and limitations

Images and camera frames are sent to the local Flask server for analysis. This project does not intentionally save uploaded images or camera frames. Do not use it to make consequential decisions about people.

The model estimates patterns in visible facial expressions. It cannot reliably determine a person's actual internal emotional state, intent, personality, or mental health. Predictions can be affected by lighting, pose, image quality, and model bias.
