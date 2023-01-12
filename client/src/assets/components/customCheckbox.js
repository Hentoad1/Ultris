import React from 'react';

import { ReactComponent as Checkmark } from '../../assets/svgs/Basic_Checkmark.svg';

import './customCheckbox.css';

function CustomCheckbox(props){
  let inputFunc = (e) => {
    console.log(e)
    
    e.target.focus(true);

    if (props.onInput){
      props.onInput(e);
    }
  }

  return (
    <div className={'CustomCheckbox ' + (props.className ?? '')} style={props.style}>
      <input type='checkbox' onInput={inputFunc} defaultChecked = {props.defaultChecked}/>
      <span />
      <Checkmark />
    </div>
  )
}

export default CustomCheckbox;