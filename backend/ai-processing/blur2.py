import cv2
import argparse

def process_video(input_path, output_path):
    # Load OpenCV's built-in face detector
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    cap = cv2.VideoCapture(input_path)
    
    # Get video properties
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    while cap.isOpened():
        success, image = cap.read()
        if not success:
            break

        # Convert to grayscale (required for this specific detector)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        # Apply blur to detected faces
        for (x, y, w, h) in faces:
            # Extract Region of Interest (ROI)
            roi = image[y:y+h, x:x+w]
            if roi.shape[0] > 0 and roi.shape[1] > 0:
                blurred_roi = cv2.GaussianBlur(roi, (99, 99), 30)
                image[y:y+h, x:x+w] = blurred_roi

        out.write(image)

    cap.release()
    out.release()
    print(f"✅ Processing complete. Blurred video saved to {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PrivacyShield Video Blur")
    parser.add_argument("--input", required=True, help="Path to raw CCTV video")
    parser.add_argument("--output", required=True, help="Path to save blurred video")
    args = parser.parse_args()

    print(f"🎬 Starting processing on: {args.input}")
    process_video(args.input, args.output)