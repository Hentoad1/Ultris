import {useRef, useEffect, useState, Children} from 'react';

import {ReactComponent as TextHidden} from '../../assets/svgs/Text_Hidden.svg';
import {ReactComponent as TextVisible} from '../../assets/svgs/Text_Visible.svg';

import './animatedInput.css';

function AnimatedInput(props){
  let [focused, setFocused] = useState(props.value !== undefined);
  let [value, setValue] = useState("");
  let ref = useRef();

  useEffect(() => {
    if (props.onRef){
      props.onRef(ref);
    }
  }, [])

  useEffect(() => { //incase the default value changes, the internal value also needs to change.
    if (props.value){
      setValue(props.value);
    }
  }, [props.value]);

  useEffect(() => {
    if (props.onValueChange){
      props.onValueChange(value);
    }
  }, [value])

  let inputHandler = function(e){
    setValue(e.target.value);
    if (props.inputHandler){
      props.inputHandler(e);
    }
  }

  let minimized = focused || (value !== '' || props.placeholder);
  return (
    <div className = 'AnimatedInput' style = {props.parentStyle} onBlur = {() => setFocused(false)} onFocus = {() => setFocused(true)}>
        <input ref = {ref} type = {props.type ?? 'text'} style = {props.inputStyle} onKeyUp = {props.onKeyUp} defaultValue = {props.value} onInput = {e => inputHandler(e)} placeholder = {props.placeholder}/>
        <span className = {minimized ? 'minimized' : ''}>{props.title}</span>
        <div className = 'iconWrapper'>
            {Children.map(props.children,(icon,key) => <div className = 'icon' key = {key}>{icon}</div>)}
        </div>
    </div>
  )
}

function AnimatedPasswordInput(props){
  let [visible, setVisible] = useState(false);

  let svg = visible ? 
  <TextVisible onClick = {() => setVisible(a => !a)} key = {0}/> : 
  <TextHidden onClick = {() => setVisible(a => !a)} key = {0}/>;

  let icons = [svg];
  Children.forEach(props.children,e => icons.push(e));

  return (
    <AnimatedInput type = {visible ? 'text' : 'password'} {...props}>
        {icons}
    </AnimatedInput>
  )
}

export {AnimatedInput, AnimatedPasswordInput};