import React, {useRef, useEffect, useState} from 'react';

import {ReactComponent as TextHidden} from '../../assets/svgs/Text_Hidden.svg';
import {ReactComponent as TextVisible} from '../../assets/svgs/Text_Visible.svg';

import './codeInput.css';

function CodeInput(props){

  let refs = [];
  let digits = [];
  let totalDigits = 5 // props.length;
  for (let i = 0; i < totalDigits; i++){
    let refHandler = function(ref){
      refs[i] = ref;
    
      if (ref.current === undefined){
        return;
      }

      let inputHandler = function(e){
        /*let str = e.target.value;
        e.target.value = str.slice(str.length - 1).toUpperCase();

        if (i < totalDigits){
          refs[i + 1].current.focus();
        }*/
      };

      let keyHandler = function(e){
        if (e.key.length === 1){
          e.target.value = e.key.toUpperCase();
          
          if (i < totalDigits - 1){
            refs[i + 1].current.focus();
          }
        }else if (e.key === 'Backspace' && e.target.value === '' && i !== 0){
          refs[i - 1].current.focus();
          e.preventDefault();
        }
      }

      ref.current.addEventListener('input',inputHandler,false);
      ref.current.addEventListener('keydown',keyHandler,false);

      return function(){
        ref.current.removeEventListener('input', inputHandler,false);
        ref.current.removeEventListener('keydown',keyHandler,false);
      }
    }

    digits[i] = <Digit onRef = {refHandler} key = {i}/>;
  }

  return (
    <div className = 'codeInput'>
      {digits}
    </div>
  )
}

function Digit(props){
  let ref = useRef();

  useEffect(() => {
    if (typeof props.onRef === 'function'){
      return props.onRef(ref);
    }
  }, [])

  

  return(
    <div className = 'digit'>
      <input ref = {ref} maxLength = {0}/>
    </div>
  )
}

export default CodeInput;