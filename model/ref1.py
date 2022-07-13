#!/usr/bin/env python
# coding: utf-8

from fastapi import FastAPI, File, UploadFile
import uvicorn
import cv2
import os
# import aiofiles
import shutil

cascPath=os.path.dirname(cv2.__file__)+"/data/haarcascade_frontalface_default.xml"
faceCascade = cv2.CascadeClassifier(cascPath)

def captureVideo():
    video_capture = cv2.VideoCapture(0)
    while True:
        # Capture frame-by-frame
        ret, frames = video_capture.read()
        gray = cv2.cvtColor(frames, cv2.COLOR_BGR2GRAY)
        faces = faceCascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        # Draw a rectangle around the faces
        for (x, y, w, h) in faces:
            cv2.rectangle(frames, (x, y), (x+w, y+h), (0, 255, 0), 2)
        # Display the resulting frame
        cv2.imshow('Video', frames)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    video_capture.release()
    cv2.destroyAllWindows()

def detect(frame):
    if frame is not None:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = faceCascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        # Draw a rectangle around the faces
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        # Display the resulting frame
        cv2.imshow('Video', frame)
        return len(faces)>0

app = FastAPI()

@app.get("/")
def ping():
    return "Ding Dong~"

@app.post("/image/")
async def upload_image(image: UploadFile = File(...)):
    return {"filename": image.filename}
    # with open("destination.png", "wb") as buffer:
    #     shutil.copyfileobj(image.file, buffer)
    # return {"filename": image.filename}

def main():
    uvicorn.run(app, host="0.0.0.0", port=3001)

if __name__ == "__main__":
    main()





