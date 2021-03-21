import joblib
import sys

import numpy as np
import pandas as pd


WINDOW = 500
THRESHOLD = 600

def preprocess_data(filePath):
    try:
        raw = pd.read_csv(filePath)
    except:
        return []

    raw = raw.iloc[:,0]  # Take the first column only
    raw = raw.values     # Convert the pd.Series object into a numpy.ndarray
    
    data1 = [int(d) for d in raw]
    data1_preprocessed = []
    for i in range(len(data1)):
        if i % 4 == 0:
            data1_preprocessed.append(data1[i])
    return data1_preprocessed

def split_into_periods(filePath):
    data1_preprocesed = preprocess_data(filePath)
    if not data1_preprocesed or len(data1_preprocesed) == 0:
        return []
    
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

    return data_segments


fileToClassify = sys.argv[1]
modelFile = sys.argv[2]
datalist = []
try:
    datalist.extend(split_into_periods(fileToClassify))
except FileNotFoundError as e:
    print("Failed on iteration: " + str(e))
areas = []
for i in range(len(datalist)):
    areas.append(np.trapz(datalist[i][:100]))


fileToClassify = fileToClassify[fileToClassify.rfind("/")+1:]
outfile = open('output/classify/' + fileToClassify, 'w')
if (len(areas) > 0):
    df = pd.DataFrame()
    df.insert(0, "Signal Magnitude", areas, True)

    resultSet = []
    loaded_model = joblib.load(modelFile)
    resultSet.append(loaded_model.predict(df))

    outfile.write('\n'.join(resultSet[0]))
else:
    outfile.write("There was no data to classify.")


print('output/classify/' + fileToClassify)