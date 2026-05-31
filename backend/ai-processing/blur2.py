import os
import sys

import cv2


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}


def load_face_detector():
    cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
    detector = cv2.CascadeClassifier(cascade_path)
    if detector.empty():
        raise RuntimeError("OpenCV face cascade could not be loaded.")
    return detector


def expand_box(x, y, w, h, frame_width, frame_height, scale=0.22):
    pad_x = int(w * scale)
    pad_y = int(h * scale)
    start_x = max(0, x - pad_x)
    start_y = max(0, y - pad_y)
    end_x = min(frame_width, x + w + pad_x)
    end_y = min(frame_height, y + h + pad_y)
    return start_x, start_y, end_x, end_y


def blur_faces(frame, detector):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector.detectMultiScale(
        gray,
        scaleFactor=1.08,
        minNeighbors=5,
        minSize=(32, 32),
    )

    height, width = frame.shape[:2]
    for (x, y, w, h) in faces:
        start_x, start_y, end_x, end_y = expand_box(x, y, w, h, width, height)
        roi = frame[start_y:end_y, start_x:end_x]
        if roi.size == 0:
            continue

        kernel = max(35, ((min(roi.shape[:2]) // 2) * 2) + 1)
        blurred = cv2.GaussianBlur(roi, (kernel, kernel), 0)
        frame[start_y:end_y, start_x:end_x] = blurred

    return frame


def process_image(input_path, output_path, detector):
    image = cv2.imread(input_path)
    if image is None:
        raise RuntimeError("Input image could not be read.")

    blurred = blur_faces(image, detector)
    if not cv2.imwrite(output_path, blurred):
        raise RuntimeError("Processed image could not be written.")


def process_video(input_path, output_path, detector):
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise RuntimeError("Input video could not be opened.")

    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    if width <= 0 or height <= 0:
        cap.release()
        raise RuntimeError("Input video has invalid dimensions.")

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    if not out.isOpened():
        cap.release()
        raise RuntimeError("Processed video could not be opened for writing.")

    while True:
        success, frame = cap.read()
        if not success:
            break

        out.write(blur_faces(frame, detector))

    cap.release()
    out.release()


def process_media(input_path, output_path):
    extension = os.path.splitext(input_path)[1].lower()
    detector = load_face_detector()

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    if extension in IMAGE_EXTENSIONS:
        process_image(input_path, output_path, detector)
    elif extension in VIDEO_EXTENSIONS:
        process_video(input_path, output_path, detector)
    else:
        raise RuntimeError(f"Unsupported file extension: {extension}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python blur2.py <input_path> <output_path>", file=sys.stderr)
        sys.exit(1)

    try:
        process_media(sys.argv[1], sys.argv[2])
        print("SUCCESS")
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
