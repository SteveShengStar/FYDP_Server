import React, {useState} from 'react'
import TextInput from '../components/TextInput'

const NBayesInputs = ({formValues, updateForm}) => {
    return (
        <div>
            {
                Object.keys(formValues).map((k) => (
                    <TextInput
                        key={k} 
                        label={k} 
                        currentValue={formValues[k]} 
                        handleUpdateField={(label, value) => updateForm("naive_bayes", label, value)}
                    />
                ))
            }
        </div>
    )
}
export default NBayesInputs