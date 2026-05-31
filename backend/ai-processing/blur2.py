import cv2
import numpy as np
import urllib.request
import os
import sys  # Replaced argparse with sys

def download_model_files():
    prototxt_path = "deploy.prototxt"
    caffemodel_path = "res10_300x300_ssd_iter_140000.caffemodel"
    
    if not os.path.exists(prototxt_path):
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt", 
            prototxt_path
        )
        
    if not os.path.exists(caffemodel_path):
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel", 
            caffemodel_path
        )
        
    return prototxt_path, caffemodel_path

def process_video(input_path, output_path):
    prototxt, caffemodel = download_model_files()
    net = cv2.dnn.readNetFromCaffe(prototxt, caffemodel)
    cap = cv2.VideoCapture(input_path)
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))
        net.setInput(blob)
        detections = net.forward()

        for i in range(0, detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > 0.5:
                box = detections[0, 0, i, 3:7] * np.array([width, height, width, height])
                (startX, startY, endX, endY) = box.astype("int")
                
                startX, startY = max(0, startX), max(0, startY)
                endX, endY = min(width, endX), min(height, endY)

                roi = frame[startY:endY, startX:endX]
                if roi.shape[0] > 0 and roi.shape[1] > 0:
                    blurred_roi = cv2.GaussianBlur(roi, (99, 99), 30)
                    frame[startY:endY, startX:endX] = blurred_roi

        out.write(frame)

    cap.release()
    out.release()
    # Node.js will listen for this exact string to know it finished successfully
    print("SUCCESS")

if __name__ == "__main__":
    # Node.js passes arguments directly: python blur2.py <input> <output>
    if len(sys.argv) < 3:
        print("ERROR: Missing input or output paths.")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    process_video(input_file, output_file)