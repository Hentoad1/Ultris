import React from 'react';

import { ReactComponent as Checkmark } from '../../assets/svgs/Basic_Checkmark.svg';

import styles from './customCheckbox.css';

function CustomCheckbox(props){
  let inputFunc = (e) => {
    e.target.focus({focusVisible:true});

    if (props.onInput){
      props.onInput(e);
    }
  }

  return (
    <div className = {(styles.CustomCheckbox + ' ' + (props.className ?? '')).trimEnd()} style={props.style}>
      <input type='checkbox' onInput={inputFunc} defaultChecked = {props.defaultChecked}/>
      <span />
      <Checkmark />
    </div>
  )
}

export default CustomCheckbox;