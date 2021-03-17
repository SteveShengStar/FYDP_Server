#!/usr/bin/env python
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split

from random import randint
import pandas as pd
import sys


fileName = sys.argv[1]
testPercent = float(sys.argv[2])
maxIter = int(sys.argv[3])
dual = int(sys.argv[4])
C = int(sys.argv[5])

data = pd.read_csv(fileName)

# Data Replacement
# data['Defect_type'] = data['Defect_type'].replace('cracked_surface', 'not_corona')
# data['Defect_type'] = data['Defect_type'].replace('Wet_surface', 'not_corona')
# Filter out certain values that we don't want to use for this trial
# data = data[data['Defect_type'] != 'Corona']
# Print values to double-check
# print(data['Defect_type'].unique())

# Train-Test Split
X = data[["60_Hz", "120_Hz", "180_Hz"]]
y = data["Defect_type"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=testPercent, random_state=randint(0, 60))

# Build the Naive Bayes Model and train it
classifier = LinearSVC(max_iter=maxIter, dual=dual, C=C)
classifier.fit(X_train, y_train)


accuracy = classifier.score(X_train, y_train)
print(accuracy)