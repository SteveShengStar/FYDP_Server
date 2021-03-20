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

    border: 1px solid #606060;
    border-radius: 5px;
    width: 120px;
    height: 25px;

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
    }).then(function (res) {
      console.log("Success")
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

  return (<div style={{overflow: "hidden"}}>
            <Head>
                <title>Home</title>
            </Head>
            <div style={{boxSizing: 'border-box', float: 'left', width: '66.67%', height: "700px", backgroundColor: "#F0F0F0", borderRight: "2px solid black"}}>
              <div style={{ padding: '20px'}}></div>
            </div>
            <div style={{boxSizing: 'border-box', float: 'left', width: '33.33%'}}>
              <div style={{
                padding: '20px'
              }}>
                <div>

                  <div style={{marginBottom: '20px'}}>
                    <div style={{marginBottom: '5px'}}>Upload a file containing training data.</div>
                    <div>
                      <FileUploadButton 
                        label={uploadedFiles.length == 0 ? "No files chosen" : uploadedFiles.length.toString() + " files chosen"} 
                        addUploadedFiles={(newFiles) => setUploadedFiles([...uploadedFiles, ...newFiles])}
                        removeAllFiles={removeAllFiles}
                      />
                    </div>
                  </div>

                  <SelectInput
                    label="Machine Learning Model"
                    currentOpt={mlModel}
                    handleUpdateField={(opt) => setMlModel(opt)}
                  />

                  {
                    renderFields(mlModel.value)
                  }
                  
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

