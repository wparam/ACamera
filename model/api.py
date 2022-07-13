#!/usr/bin/env python
# coding: utf-8

from flask import Flask, request
from werkzeug.utils import secure_filename
import numpy
import cv2
import os

cascPath=os.path.dirname(cv2.__file__)+"/data/haarcascade_frontalface_default.xml"
faceCascade = cv2.CascadeClassifier(cascPath)
rootPath = "/storage"
inputpath = "./input_images"
outputpath = "./output_images"

app = Flask(__name__)

def detect(frame, imagename):
    # gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = faceCascade.detectMultiScale(
        frame,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE
    )
    # Draw a rectangle around the faces
    person = 1
    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        cv2.putText(frame, f'person {person}', (x,y), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0,0,255), 2)
        person += 1
    
    cv2.putText(frame, f'Total Persons : {person-1}', (40,40), cv2.FONT_HERSHEY_DUPLEX, 1.5, (255,0,0), 2)

    if not os.path.exists(os.path.join(rootPath, outputpath)):
        os.makedirs(os.path.join(rootPath, outputpath))
        
    cv2.imwrite(os.path.join(rootPath, outputpath, imagename), frame)
    # return {"result": 1}
    return {"result": len(faces)>0}

@app.route("/")
def ping():
    return "Ding Dong~"

@app.route("/storage")
def storage():
    if not os.path.exists(rootPath):
        return { "storage" : False }
    return { "storage" : True }

@app.route("/test", methods = ['POST'])
def test():
    return { "test" : True }

@app.route("/image", methods = ['POST'])
def upload_image():
    if not os.path.exists(os.path.join(rootPath)):
        return {"result": False}
    else:
        if not os.path.exists(os.path.join(rootPath, inputpath)):
            os.makedirs(os.path.join(rootPath, inputpath))

        f = request.files['image']
        imagename = secure_filename(f.filename)    
        filename = os.path.join(rootPath, inputpath, imagename)
        print(filename)
        f.save(filename)
        img = cv2.imread(filename)
        res = detect(img, imagename)
        print(res)
        return res


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3001, debug=True)





