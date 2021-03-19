#!/usr/bin/env python
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

import numpy as np
import pandas as pd


WINDOW = 500
THRESHOLD = 600

def preprocess_data(filename):
    raw = pd.read_csv(filename)
    raw = raw.iloc[1:]   # Cut off unnecessary data at the beginning
    raw = raw.iloc[:,0]  # Take the first column only
    raw = raw.values     # Convert the pd.Series object into a numpy.ndarray

    data1 = [int(d) for d in raw]
    data1_preprocessed = []
    data1_class = data1[0]
    for i in range(1, len(data1)):
        if i % 4 == 0:
            data1_preprocessed.append(data1[i])
    return data1_preprocessed, data1_class

def split_into_periods(filename):
    data1_preprocesed, data1_class = preprocess_data(filename)
    
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


fileNames = sys.argv[1]
testPercent = float(sys.argv[2])
maxIter = int(sys.argv[3])
dual = int(sys.argv[4])
C = int(sys.argv[5])
data = pd.read_csv(fileName)



datalist = []
categories = []
fileNamesArray = fileNames.split(',')
for fileName in fileNamesArray:
    try:
        datacontents, classes = split_into_periods(fileName)
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


X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=0)
classifier = LinearSVC(max_iter=maxIter, dual=dual, C=C)
classifier.fit(X_train, y_train)

print(classifier.score(X_train, y_train))