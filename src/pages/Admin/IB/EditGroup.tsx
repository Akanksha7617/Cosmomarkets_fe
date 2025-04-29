import React, { useState } from 'react'
import SearchBox from '@/tools/SearchBox'
import { Button, Input, InputNumber, Space } from 'antd'
import './../../../global.scss'

const options1 = [
    {
        value: 'selectrows',
        label: 'Assignee For Selected Rows',
    },
]

const options2 = [
    {
        value: 'percetage',
        label: 'Percetage',
    },
    {
        value: 'amount',
        label: 'Amount',
    },
]

const EditGroup: React.FC = () => {

    const [value, setValue] = useState('1');
    const [inputValues, setInputValues] = useState([]);

    const handleChange = (value) => {
        setValue(value);
        setInputValues(Array.from({ length: value }, () => ''))
    }

    const handleInputChange = (index, inputValue) => {
        const newInputValues = [...inputValues];
        newInputValues[index] = inputValue;
        setInputValues(newInputValues);
    };

    return (
        <div>
            <div className='search-box-1'>
                <SearchBox
                    option={options1}
                />
                <Space direction='vertical' style={{ paddingTop: '3%', width: 300 }}>

                    <InputNumber defaultValue={1} value={value} onChange={handleChange} />

                    {inputValues.map((inputValue, index) => (
                        <div >
                            {`L ${index + 1}`} 
                            <div style={{ display: 'inline-flex' ,alignContent:'center'}}>
                                <div className='model-level'>
                                    <Input
                                        key={index}
                                        placeholder={`Input ${index + 1}`}
                                        value={inputValue}
                                        onChange={(e) => handleInputChange(index, e.target.value)}

                                    />
                                    
                                </div>
                                {`Type`}
                                <div  className='model-type'>
                                    
                                    <div >
                                        <SearchBox
                                            option={options2}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button type='primary'>Submit</Button>

                </Space>
            </div>
        </div>
    )
}

export default EditGroup