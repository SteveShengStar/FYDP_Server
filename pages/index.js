import React, {useState} from 'react'
import Head from 'next/head'
import styled from 'styled-components';
import TextInput from '../components/TextInput'
import SelectInput from '../components/SelectInput'
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

const Home = () => {
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

  const addTrainingResults = (newResultSet) => {
    console.log("newResultSet")
    console.log(newResultSet)
    console.log("trainingResults")
    console.log(trainingResults)
    setTrainingResults([...trainingResults, newResultSet])
    setFileListExpanded(fileListExpanded.concat(false))   // Ensure the most recent result's file list is collapsed (not expanded)
  }

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    for (var i = 0; i < uploadedFiles.length; i++) {
      var file = uploadedFiles[i];
      formData.append('uploads[]', file, file.name);
    }
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

  const removeAllFiles = () => {
      setUploadedFiles([])
  }

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

  return (<div style={{display: 'flex', minHeight: '100vh'}}>
            <div style={{boxSizing: 'border-box', flexBasis: '60%', backgroundColor: "#e3e3e3", borderRight: "2px solid black"}}>
              <div style={{ padding: '20px'}}>

                <h2 style={{marginBottom: '30px', textAlign: 'center'}}>Training Results</h2>
                {trainingResults.length > 0 ?
                  (trainingResults.map((r, i) => (
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
                        <span><b>Accuracy achieved on validation data:</b> {r.modelAccuracy}</span>
                      </div>
                    </div>
                  ))) :
                  <div>There are no results to show so far. Please upload a file and tune the ML parameters on the Settings Panel (right) to get started.</div>
                }

              </div>
            </div>
            <div style={{boxSizing: 'border-box', flexBasis: '40%'}}>
              <div style={{
                padding: '20px'
              }}>
                <div>
                  <h2 style={{marginBottom: '30px', textAlign: 'center'}}>Settings Panel</h2>
                  <div style={{marginBottom: '30px'}}>
                    <div style={{marginBottom: '5px'}}><h4 style={{margin: 0}}>1. Upload a File containing Training Data.</h4></div>
                    <div>
                      <FileUploadButton 
                        label={uploadedFiles.length == 0 ? "No files chosen" : uploadedFiles.length.toString() + " files chosen"} 
                        addUploadedFiles={(newFiles) => setUploadedFiles([...uploadedFiles, ...newFiles])}
                        removeAllFiles={removeAllFiles}
                      />
                    </div>
                  </div>
                  <div style={{marginBottom: '30px'}}>
                    <h4 style={{marginBottom: '5px'}}>2. Tune the Machine Learning Parameters.</h4>
                    <SelectInput
                      label="Machine Learning Model"
                      currentOpt={mlModel}
                      handleUpdateField={(opt) => setMlModel(opt)}
                    />

                    {
                      renderFields(mlModel.value)
                    }
                  </div>
                  <SubmitButton onClick={onSubmit}>
                      Start Training
                  </SubmitButton>
                </div>
              </div>
            </div>
          </div>
    )
};
export default Home

