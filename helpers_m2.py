WINDOW = 500
THRESHOLD = 600

def preprocess_data_m2(filename):
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

def split_into_periods_m2(filename):
    data1_preprocesed = preprocess_data_m2(filename)
    if (len(data1_preprocesed) == 0):
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