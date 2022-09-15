import React, {useRef, useEffect, useState} from 'react';

import {ReactComponent as TextHidden} from '../../assets/svgs/Text_Hidden.svg';
import {ReactComponent as TextVisible} from '../../assets/svgs/Text_Visible.svg';

import './codeInput.css';

function CodeInput(props){
  let [value, setValue] = useState(new Array(props.length).fill(' '));

  useEffect(() => {
    if (typeof props.getValue === 'function'){
      props.getValue(value.join(''));
    }
  })

  let refs = [];
  let digits = [];
  let totalDigits = props.length;
  for (let i = 0; i < totalDigits; i++){
    let refHandler = function(ref){
      refs[i] = ref;
    
      if (ref.current === undefined){
        return;
      }

      let InputHandler = function(e){
        let regex = /^[1-9a-zA-Z]*$/
        if (e.data && regex.test(e.data)){
          let value = e.data.toUpperCase();

          e.target.value = value;

          setValue(arr => {
            let clone = arr.slice();
            clone[i] = value;
            return clone;
          });

          if (i < totalDigits - 1){
            refs[i + 1].current.focus();
          }
        } 
      }

      let keyDownHandler = function(e){
        if (e.key.length === 1){
        }else if (e.key === 'Backspace' && e.target.value === '' && i !== 0){
          refs[i - 1].current.focus();
          e.preventDefault();
        }
      }

      let pasteHandler = function(e){
        e.preventDefault();
        e.stopPropagation();

        let text = e.clipboardData.getData('text/plain');
        
        this.pasteRelay(text);
      }

      ref.current.pasteRelay = function(string){
        let value = (string[0] ?? '').toUpperCase();
        this.value = value;

        setValue(arr => {
          let clone = arr.slice();
          clone[i] = value;
          return clone;
        });

        if (i < totalDigits - 1){
          refs[i + 1].current.pasteRelay(string.slice(1));
        }
      }


      ref.current.addEventListener('input',InputHandler,false);
      ref.current.addEventListener('keydown',keyDownHandler,false);
      ref.current.addEventListener('paste',pasteHandler,false);

      return function(){
        if (ref.current){
          ref.current.removeEventListener('input',InputHandler,false);
          ref.current.removeEventListener('keydown',keyDownHandler,false);
          ref.current.removeEventListener('paste',pasteHandler,false);
        }
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
      <input ref = {ref}/>
    </div>
  )
}

export default CodeInput;