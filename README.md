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

The requirements pin OpenCV to version 4 (`opencv-python>=4.8,<5`) because the OpenCV 4 Python package includes the Haar cascade data files used by the OpenCV face detector. Avoid installing OpenCV 5 for this project until the detector setup is updated.

Run the application:

```bash
python app.py
```

Open http://127.0.0.1:5000 in your browser.

DeepFace may download model weights the first time it runs. Camera access generally works on localhost; deployed sites should use HTTPS.

### Windows troubleshooting

- **Haar cascade file not found:** install dependencies again with `pip install -r requirements.txt`. This project pins OpenCV below version 5 so the expected cascade data is included with the package. If OpenCV 5 was installed previously, reinstall the pinned version: `pip uninstall opencv-python opencv-contrib-python -y` followed by `pip install -r requirements.txt`.
- **`charmap` / UnicodeEncodeError in the terminal:** `app.py` configures standard output and error streams to replace characters unsupported by the Windows console before importing DeepFace. Run the updated `app.py` from this repository.

## Privacy and limitations

Images and camera frames are sent to the local Flask server for analysis. This project does not intentionally save uploaded images or camera frames. Do not use it to make consequential decisions about people.

The model estimates patterns in visible facial expressions. It cannot reliably determine a person's actual internal emotional state, intent, personality, or mental health. Predictions can be affected by lighting, pose, image quality, and model bias.
