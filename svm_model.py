#!/usr/bin/env python
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from helpers import split_into_periods

import numpy as np
import pandas as pd
import joblib
import sys


filePaths = sys.argv[1]
testPercent = float(sys.argv[2])
maxIter = int(sys.argv[3])
dual = int(sys.argv[4])
C = int(sys.argv[5])
timeStamp = sys.argv[6]
mode = sys.argv[7]


datalist = []
categories = []
filePathsArray = filePaths.split(',')
for filePath in filePathsArray:
    try:
        datacontents, classes = split_into_periods(filePath)
        # print(datacontents)
        if datacontents and (len(datacontents) > 0):
            datalist.extend(datacontents)
            categories.extend(classes)
    except FileNotFoundError:
        print("Failed on iteration: " + str(i))

# Differentiate between External Noise and Electrical Discharge Signals
final_categories = []
if (mode == '1'):
    all_stats = {
        "Mean Sector 1": [],
        "Mean Sector 2": [],
        "Standard Deviation Sector 1": [],
        "Standard Deviation Sector 2": []
    }
    for i in range(len(datalist)):
        if len(datalist[i]) > 0:
            all_stats["Mean Sector 1"].append(sum(datalist[i][:100]) / 100)
            all_stats["Mean Sector 2"].append(sum(datalist[i][100:300]) / 200)
            all_stats["Standard Deviation Sector 1"].append(np.std(datalist[i][:100]))
            all_stats["Standard Deviation Sector 2"].append(np.std(datalist[i][100:300]))
            final_categories.append(categories[i])
else:
    all_stats = {
        "Area": [],
        "Std Dev": [],
        "Mean": [],
    }
    for i in range(len(datalist)):
        if (len(datalist[i]) > 0):
            all_stats["Area"].append(np.trapz(datalist[i][:100]))
            all_stats["Std Dev"].append(np.std(datalist[i][:100]))
            all_stats["Mean"].append(np.mean(datalist[i][:100]))
            final_categories.append(categories[i])

x = pd.DataFrame(data=all_stats)


X_train, X_test, y_train, y_test = train_test_split(x, final_categories, test_size=testPercent, random_state=0)
classifier = LinearSVC(max_iter=maxIter, dual=dual, C=C)
classifier.fit(X_train, y_train)

# TODO: add proper error handling from Node.js
try: 
    joblib.dump(classifier, "LinearSVC_"+timeStamp+"_mode" + mode + ".pkl")
except Exception as e:
    print(e)

print(classifier.score(X_test, y_test))