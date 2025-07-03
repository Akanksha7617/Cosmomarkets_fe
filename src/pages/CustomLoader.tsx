import React from 'react';
import './master.scss'
import { DollarCircleFilled } from '@ant-design/icons';
import { RingLoader } from 'react-spinners'; 


// const override = css`
//   display: block;
//   margin: 0 auto;
//   border-color: red; // Customize the color if needed
// `;

const CustomLoader = () => {
  return (
    <div className="loader-container">
            {/* <RingLoader  size={150} color={'#123abc'} loading={true} /> */}

     <div className="loader"><img src='/images/loder.gif' style={{width:200,height:200}} /></div>
    </div>
  );
};

export default CustomLoader;