import React, {useState} from 'react'
import Head from 'next/head'
import styled from 'styled-components';
import TextInput from '../components/TextInput'
import SelectInput from '../components/SelectInput'
import FileUploadButton from '../components/FileUploadButton'

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
  const [uploadedFile, setUploadedFile] = useState(undefined);
  const [mlModel, setMlModel] = useState("99");
  const [form, setFormValues] = useState({
      max_iter: "",
      dual: "",
      C: "",
  });

  const updateForm = (label, value) => {
    setFormValues({
      ...form,
      [label]: value,
    })
  }
  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('file', uploadedFile)
    formData.append('mlModelName', mlModel)
    formData.append('trainPercent', 0.8)
    formData.append('testPercent', 0.2)
    formData.append('maxIter', form.max_iter)
    formData.append('dual', form.dual)
    formData.append('C', form.C)

    fetch("http://localhost:3000/api/putResults", {
      mode: 'no-cors',
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
        "Accept": "application/json",
        "type": "formData"
      },
      body: formData
    }).then(function (res) {
      console.log("Success")
    })
  }
  //console.log(Object.keys(form).map(k => k))
  return (<div>
            <Head>
                <title>Home</title>
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <div>
                <div style={{float: 'left', width: '66.67%'}}>
                  <div style={{
                    padding: '20px'
                  }}/>
                </div>
            </div>
            <div style={{float: 'left', width: '33.33%'}}>
              <div style={{
                padding: '20px'
              }}>
                <div>

                  <div style={{marginBottom: '20px'}}>
                    <div style={{marginBottom: '5px'}}>Upload a file containing training data.</div>
                    <div>
                      <input type="file" id="upload-btn" hidden />
                      <FileUploadButton 
                        for="upload-btn" 
                        uploadedFileName={uploadedFile ? uploadedFile.name : "No file chosen"} 
                        setUploadedFile={setUploadedFile}
                      />
                    </div>
                  </div>

                  <SelectInput
                    label={"Machine Learning Model"}
                    currentOpt={mlModel}
                    handleUpdateField={(opt) => setMlModel(opt)}
                  />
                  {
                    Object.keys(form).map((k) => (
                      <TextInput
                        key={k} 
                        label={k} 
                        currentValue={form[k]} 
                        handleUpdateField={updateForm}
                      />
                    ))
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

