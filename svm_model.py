#!/usr/bin/env python
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

import numpy as np
import pandas as pd
import joblib
import sys

WINDOW = 500
THRESHOLD = 600

def preprocess_data(filePath):
    try:
        raw = pd.read_csv(filePath)
    except:
        return [], "none"

    data_class = raw.columns[0]
    raw = raw.iloc[:,0]  # Take the first column only
    raw = raw.values     # Convert the pd.Series object into a numpy.ndarray
    
    data1 = [int(d) for d in raw]
    data1_preprocessed = []
    for i in range(len(data1)):
        if i % 4 == 0:
            data1_preprocessed.append(data1[i])
    return data1_preprocessed, data_class

def split_into_periods(filePath):
    data1_preprocesed, data1_class = preprocess_data(filePath)
    if (data1_class == "none"):
        return [], []
    
    counter = 0
    spike_start_indices = []
    spike_detected = False
    for d_i in range(len(data1_preprocesed)):
        if (data1_preprocesed[d_i] > THRESHOLD) and spike_detected == False:
            spike_detected = True;
            spike_start_indices.append(d_i - 10)
        if spike_detected:
            if counter < WINDOW:
                counter += 1
            else:
                spike_detected = False;
                counter = 0
    
    data_segments = []
    for s_i in range(len(spike_start_indices) - 1):
        data_segments.append(data1_preprocesed[spike_start_indices[s_i]:spike_start_indices[s_i+1]])
    classes = [data1_class] * len(data_segments)

    return data_segments, classes


filePaths = sys.argv[1]
testPercent = float(sys.argv[2])
maxIter = int(sys.argv[3])
dual = int(sys.argv[4])
C = int(sys.argv[5])
timeStamp = sys.argv[6]


datalist = []
categories = []
filePathsArray = filePaths.split(',')
for filePath in filePathsArray:
    try:
        datacontents, classes = split_into_periods(filePath)
        if datacontents and (len(datacontents) > 0):
            datalist.extend(datacontents)
            categories.extend(classes)
    except FileNotFoundError:
        print("Failed on iteration: " + str(i))
areas = []
for i in range(len(datalist)):
    areas.append(np.trapz(datalist[i][:100]))


x = pd.DataFrame()
x.insert(0, "Area", areas, True)
y = categories


X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=testPercent, random_state=0)
classifier = LinearSVC(max_iter=maxIter, dual=dual, C=C)
classifier.fit(X_train, y_train)

# joblib.dump(classifier, "LinearSVC_"+timeStamp+".pkl")
# print("AA")

print(classifier.score(X_train, y_train))