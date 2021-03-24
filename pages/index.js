import React, {useState} from 'react'
import Head from 'next/head'
import styled from 'styled-components';
import TextInput from '../components/TextInput'
import SelectInput from '../components/SelectInput'
import Tab from '../components/Tab'
import FileUploadButton from '../components/FileUploadButton'

import SVMInputs from './svm_model'
import NBayesInputs from './nbayes_model'

const SubmitButton = styled.button`
    background-color: #00cc00;
    color: #000;
    font-size: 14px;

    border: 1px solid #606060;
    border-radius: 3px;
    height: 40px;
    width: 100%;

    &:hover {
        color: #424242; 
        cursor: pointer;
        opacity: 0.8;
    }
    &:active {
        color: #000;
        cursor: pointer;
        opacity: 1;
    }
`

const modelTypes = [
  { value: '0', label: 'Please Select ...', isDisabled: true },
  { value: 'svm', label: 'SVM' },
  { value: 'random_forest', label: 'Random Forest' },
  { value: 'naive_bayes', label: 'Naive Bayes' },
];

const Home = () => {
  const [selectedTab, setSelectedTab] = useState("train");

  /* Training Tab */
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [mlModel, setMlModel] = useState("");
  const [svmForm, setSvmFormValues] = useState({
    max_iter: "",
    dual: "",
    C: "",
  });
  const [nBayesForm, setNBayesFormValues] = useState({
    var_smoothing: ""
  });
  const [trainingResults, setTrainingResults] = useState([]);
  const [fileListExpanded, setFileListExpanded] = useState([]);

  /* Classify Tab */
  const [fileToClassify, setFileToClassify] = useState(undefined);
  const [modelFileName, setModelFileName] = useState(undefined);
  const [classifyResults, setClassifyResults] = useState([]);

  const [diffMode, setDiffMode] = useState('0');

  /* Functions to modify Local State variables for Training Tab */
  const updateForm = (mlModelName, label, value) => {
    switch(mlModelName) {
      case 'svm': 
        setSvmFormValues({...svmForm, [label]: value})
        break;
      case 'naive_bayes':
        setNBayesFormValues({...nBayesForm, [label]: value})
        break;
    }
  };

  const renderFields = (mlModel) => {
    switch(mlModel) {
      case 'svm':
        return (<SVMInputs 
                  formValues={svmForm}
                  updateForm={updateForm}
                />)
        break;
      case 'naive_bayes':
        return (<NBayesInputs 
                  formValues={nBayesForm}
                  updateForm={updateForm}
                />)
        break;
      default: break;
      }
  }

  const onSubmitTraining = (e) => {
    e.preventDefault();
    const formData = new FormData();

    for (var i = 0; i < uploadedFiles.length; i++) {
      var file = uploadedFiles[i];
      formData.append('uploads[]', file, file.name);
    }
    formData.append('mode', diffMode.value)
    formData.append('mlModelName', mlModel.value)
    formData.append('trainPercent', 0.8)
    formData.append('testPercent', 0.2)

    if (mlModel.value === 'svm') {
      formData.append('maxIter', svmForm.max_iter)
      formData.append('dual', svmForm.dual)
      formData.append('C', svmForm.C)
    }
    if (mlModel.value === 'naive_bayes') {
      formData.append('varSmoothing', nBayesForm.var_smoothing)
    }

    fetch("http://localhost:3000/api/putResults", {
      mode: 'no-cors',
      method: "POST",
      headers: {
        "Accept": "application/json",
      },
      body: formData
    })
    .then(res => res.json())
    .then(function (res) {
      addTrainingResults(res.body);
    })
  };

  const addTrainingResults = (newResultSet) => {
    setTrainingResults([...trainingResults, newResultSet])
    setFileListExpanded(fileListExpanded.concat(false))   // Ensure the most recent result's file list is collapsed (not expanded)
  }

  const removeAllFiles = () => {
    setUploadedFiles([])
  }

  /* Functions to modify Local State variables for Classify Tab*/
  const onSubmitClassify = (e) => {
    const formData = new FormData();     // TODO: dynamically set train/test ratio later
    formData.append('uploadFileName', fileToClassify, fileToClassify.name);
    formData.append('modelFileName', modelFileName);
    formData.append('mode', diffMode.value)

    fetch("http://localhost:3000/api/classify", {
      mode: 'no-cors',
      method: "POST",
      headers: {
        "Accept": "application/json",
      },
      body: formData
    })
    .then(res => res.json())
    .then(function (res) {
      addClassifyResults(res.message);
      console.log(res)
    })
  }

  const addClassifyResults = (newResultText) => {
    setClassifyResults([...classifyResults, newResultText]);
  }

  const removeFileToClassify = () => {
    setFileToClassify(undefined)
  }

  return (<div style={{display: 'flex', minHeight: '100vh'}}>
            <div style={{boxSizing: 'border-box', flexBasis: '60%', backgroundColor: "#e3e3e3", borderRight: "2px solid black"}}>
              <div style={{ padding: '20px'}}>
                
                <h2 style={{marginBottom: '30px', textAlign: 'center'}}>
                  {selectedTab === 'train' ? 
                    <React.Fragment>Training Results</React.Fragment>
                    :
                    <React.Fragment>Classify Results</React.Fragment>
                  }
                </h2>
                {selectedTab === "train" ?
                  <React.Fragment>
                  {trainingResults.length > 0 ?
                    <React.Fragment>
                    {trainingResults.map((r, i) => (
                      <div key={i} style={{ marginBottom: '20px',
                                            padding: '10px 15px',
                                            borderRadius: '5px',
                                            backgroundColor: '#ffffff'}}>
                        <div>
                          <span><b>Date:</b> {r.date}</span>
                        </div>
                        <div>
                          { 
                            fileListExpanded[i] ? 
                            <div>
                              <div>
                                <b style={{textDecoration: 'underline'}}>Files that were Processed:</b> {r.fileNames.map((fn, j) => <div key={j}>{fn},</div>)}
                              </div>
                              <div><span style={{cursor: 'pointer', textDecoration: 'underline', color: '#0000ff'}} onClick={() => setFileListExpanded(fileListExpanded.slice(0,i).concat(!fileListExpanded[i]).concat(fileListExpanded.slice(i+1)))}>Click to Collapse</span></div>
                            </div>
                              :
                            <div><div><b style={{textDecoration: 'underline'}}>Files that were Processed:</b> {r.fileNames.slice(0, 3).map((fn, j) => <div key={j}>{fn},</div>)}</div>
                              {
                                r.fileNames.length > 3 && 
                                <div>... and many others <span> </span>
                                <span style={{cursor: 'pointer', textDecoration: 'underline', color: '#0000ff'}} onClick={() => setFileListExpanded(fileListExpanded.slice(0,i).concat(!fileListExpanded[i]).concat(fileListExpanded.slice(i+1)))}>Click to Expand</span></div>
                              }
                            </div> 
                          }
                        </div>
                        <div>
                          <span><b>ML Model used:</b> {r.mlModelName}</span>
                        </div>
                        <div>
                          <div><b style={{textDecoration: 'underline'}}>Parameters used:</b> {r.parameterValues.map((param, j) => <div key={j}>{param.name}: {param.value}</div>)}</div>
                        </div>
                        <div>
                          <span><b>Train/Test Split:</b> {r.trainTestSplit.train * 100}:{r.trainTestSplit.test * 100}</span>
                        </div>
                        <div>
                          <span><b>Accuracy achieved on validation data:</b> {r.accuracy}</span>
                        </div>
                        <div>
                          <span><b>Classification Mode:</b> {r.mode == '1' ? "Ambient Noise vs. Discharge" : "Silence vs. Discharge"}</span>
                        </div>
                      </div>
                      ))
                      }
                      </React.Fragment>
                      :
                      <div>There are no results to show so far. Please upload a file and tune the ML parameters on the Model Settings Panel (right) to get started.</div>
                    }
                    </React.Fragment>
                    :
                    <React.Fragment>
                    {classifyResults.length > 0 ?
                      <React.Fragment>
                      {classifyResults.map((c_r, c_i) => 
                        <div key={c_i} style={{ marginBottom: '20px' }}>
                          {c_r}
                        </div>
                      )}
                      </React.Fragment>
                      :
                      <div>There are no results to show so far. Please upload a file with data to classify on the Classify Panel (right side).</div> 
                    }
                    </React.Fragment>
                }
              </div>
            </div>
            <div style={{boxSizing: 'border-box', flexBasis: '40%'}}>
              <div style={{
                paddingTop: '10px',
                paddingLeft: '20px',
                paddingRight: '20px',
                height: '100vh',
                boxSizing: 'border-box',
                minHeight: '100vh',
                height: '100%',
              }}>
                <div style={{display: 'flex', flexDirection: 'column', height: "100%"}}>
                  <div style={{display: 'flex'}}>
                    <Tab style={{marginRight: '5px'}} selected={selectedTab === 'train'} onClick={() => setSelectedTab('train')}>Train</Tab>
                    <Tab selected={selectedTab === 'classify'} onClick={() => setSelectedTab('classify')}>Classify</Tab>
                  </div>
                  <div style={{marginLeft: '-20px', marginRight: '-20px', marginTop: '-1px', paddingLeft: '20px', paddingRight: '20px', 
                                paddingTop: '20px', backgroundColor: "#e3e3e3", borderTop: '2px solid #606060', flexGrow: 1}}>
                    <h2 style={{marginBottom: '30px', marginTop: 0, textAlign: 'center'}}>
                        {
                          (selectedTab === 'train') ? 
                            <span>Model Settings</span> : 
                            <span>Classification</span>
                        }
                    </h2>
                    <div style={{marginBottom: '30px'}}>
                        <h4 style={{marginBottom: '5px'}}>1. Which classes are you differentiating between?</h4>
                        <SelectInput
                          label="Mode of Differentiation"
                          currentOpt={diffMode}
                          handleUpdateField={(opt) => setDiffMode(opt)}
                          options={[
                            { value: '0', label: 'Please Select ...', isDisabled: true },
                            { value: '1', label: 'Ambient Noise and Discharge' },
                            { value: '2', label: 'Silence and Discharge' }
                          ]}
                        />
                    </div>

                    {
                      (selectedTab === 'train') ? 
                      <>
                        <div style={{marginBottom: '30px'}}>
                          <div style={{marginBottom: '5px'}}><h4 style={{margin: 0}}>2. Upload a File containing Training Data.</h4></div>
                          <div>
                            <FileUploadButton 
                              label={uploadedFiles.length == 0 ? "No files chosen" : uploadedFiles.length.toString() + " files chosen"} 
                              addUploadedFiles={(newFiles) => setUploadedFiles([...uploadedFiles, ...newFiles])}
                              removeAllFiles={removeAllFiles}
                              multiple={true}
                            />
                          </div>
                        </div>
                        <div style={{marginBottom: '30px'}}>
                          <h4 style={{marginBottom: '5px'}}>3. Tune the Machine Learning Parameters.</h4>
                          <SelectInput
                            label="Machine Learning Model"
                            currentOpt={mlModel}
                            handleUpdateField={(opt) => setMlModel(opt)}
                            options={modelTypes}
                          />

                          {
                            renderFields(mlModel.value)
                          }
                        </div>
                        <SubmitButton onClick={onSubmitTraining}>
                            Start Training
                        </SubmitButton>
                      </>
                      :
                      <>
                        <div style={{marginBottom: '30px'}}>
                          <div style={{marginBottom: '5px'}}><h4 style={{margin: 0}}>2. Upload a File containing the Data to Classify.</h4></div>
                          <div>
                            <FileUploadButton 
                              label={fileToClassify ? fileToClassify.name : "No file chosen"} 
                              addUploadedFiles={(newFile) => setFileToClassify(newFile[0])}
                              removeAllFiles={removeFileToClassify}
                            />
                          </div>
                        </div>
                        <div style={{marginBottom: '30px'}}>
                          <div style={{marginBottom: '5px'}}><h4 style={{margin: 0}}>3. Choose the ML Model .pkl file.</h4></div>
                          <div>
                            <FileUploadButton 
                              label={modelFileName ? modelFileName : "No files chosen"} 
                              addUploadedFiles={(file) => setModelFileName(file ? file[0].name : undefined)}
                              removeAllFiles={() => setModelFileName(undefined)}
                              options={modelTypes}
                            />
                          </div>
                        </div>
                        <SubmitButton onClick={onSubmitClassify}>
                            Start Classifying
                        </SubmitButton>
                      </>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
    )
};
export default Home

