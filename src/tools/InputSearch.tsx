import { Space } from 'antd'
import Search from 'antd/es/transfer/search'
import React from 'react'

import './../global.css'

const InputSearch:React.FC = () => {
  return (
    <div className='input-search-cls'>
    <Space direction="vertical">
      <Search
        placeholder="input search text"
        // onSearch={onSearch}
        style={{
          width: '200px',
        }}
        className="custom-search"
      />
    </Space>
  </div>
  )
}

export default InputSearch