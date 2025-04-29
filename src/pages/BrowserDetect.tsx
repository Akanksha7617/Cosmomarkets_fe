import React from 'react'
import { isMobileSafari,isSafari } from 'react-device-detect';
import "../common.css"

const BrowserDetect = () => {
    
    if (isMobileSafari || isSafari) {
        return (
          <div style={{textAlign:'center'}} className='login-container'>
                 
                 <span>Please ensure that you unblock the popup blocker on your <span style={{color:'red'}}>iPhone/Mac</span> (Safari Settings).</span>

          </div>
        );
      }
    
      
      return null;
    }


export default BrowserDetect