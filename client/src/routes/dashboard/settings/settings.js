import {Fragment, useState, useRef} from 'react';

import Controls from './controls.js';

import './settings.css';
import './slider.css';
import '../../../assets/styles/splitMenu.css';
import { AnimatedInput } from '../../../assets/components/animatedInput.js';

const NumberRegex = new RegExp(/[0-9]/, 'g');

function Settings(){
  return (
    <div className = 'splitMenu'>
      <div className = 'headerMenu'>
        <div className = 'header'>
          <div className = 'title'>Controls</div>
          <div className = 'description'>Edit your controls by clicking the corresponding button and then pressing the key you would like to change the binding to.</div>
        </div>
        <div className = 'content'>
          <Controls/>
        </div>
      </div>

      <div className = 'sideMenu'>
        <div className = 'header'>
          <div className = 'title'>Delayed Auto Shift</div>
          <div className = 'description'>The amount of delay until the piece will shift automatically. Increasing this delay will make it slower to start moving pieces, but will help reduce accidental movements.</div>
        </div>
        <div className = 'content'>
          <HandlingSection min = {0} max = {334} default = {334} step = {1} dir = 'rtl' name = 'DAS'/>
        </div>
      </div>

      <div className = 'sideMenu'>
        <div className = 'header'>
          <div className = 'title'>Auto Refresh Rate</div>
          <div className = 'description'>The amount of time in between shifts during the Delayed Auto Shift. Increasing this delay will make the piece move slower left and right.</div>
        </div>
        <div className = 'content'>
          <HandlingSection min = {0} max = {167} default = {167} step = {1} dir = 'rtl' name = 'ARR'/>
        </div>
      </div>

      <div className = 'sideMenu'>
        <div className = 'header'>
          <div className = 'title'>Soft Drop Factor</div>
          <div className = 'description'>The factor that is applied to the soft drop speed. Increasing this will make soft drops faster, but will make it harder to tuck pieces under an overhang.</div>
        </div>
        <div className = 'content'>
          <HandlingSection min = {1} max = {40} default = {1} step = {1} dir = 'ltr' name = 'SDF'/>
        </div>
      </div>



    </div>
  )
}

function HandlingSection(props){
  const startingString = localStorage.getItem(props.name) ?? props.default;
  const startingValue = startingString === 'Instant' ? 40 : startingString;

  let [filled, setFilled] = useState(calculateFilled(startingValue));
  let [inital, setInital] = useState(startingString);
  let [input, setInput] = useState();
  let slider = useRef();

  let sliderFunc = function(e){
    setFilled(calculateFilled(e.target.value));
  }

  let inputFunc = function(e){
    if (e.key === 'Enter'){
      let numbers = (e.target.value.match(NumberRegex) ?? []).join('');
      let number = parseInt(numbers);
      e.target.value = '';
      if (isNaN(number)){
        return;
      }
      

      if (number > props.max){
        (slider.current ?? {}).value = props.max;
        setFilled(calculateFilled(props.max));
        
      }else if (number < props.min){
        (slider.current ?? {}).value = props.min;
        setFilled(calculateFilled(props.min));
      }else{
        (slider.current ?? {}).value = number;
        setFilled(calculateFilled(number));
      }

      e.target.blur();
    }else{
      return;
    }

  }

  function calculateFilled(value){
    if (props.dir === 'rtl'){
      return 1 - ((value - props.min) / (props.max - props.min));
    }else{
      return ((value - props.min) / (props.max - props.min))
    }
  }

  let sliderValue;
  try {
    sliderValue = slider.current.value;
  } catch (error) {
    sliderValue = startingValue;
  }

  if (props.name === 'SDF' && sliderValue === 40){
    sliderValue = 'Instant';
  }

  let reset = function(){
    input.current.value = '';
    input.current.placeholder = props.default;
    slider.current.value = props.default;
    setFilled(calculateFilled(props.default));
  }

  let save = function(){
    localStorage.setItem(props.name, sliderValue);
    input.current.value = '';
    setInital(sliderValue);
  }

  return (
    <Fragment>
      <div className = 'sliderTitles'>
        <span>SLOW</span>
        <span>FAST</span>
      </div>
      <div className = 'sliderWrapper'>
        <input type = 'range' onInput = {sliderFunc} className = 'customSlider' ref = {slider} max = {props.max} min = {props.min} step = {props.step} dir = {props.dir} defaultValue = {startingValue} style = {{background:`linear-gradient(90deg,#ccc ${filled * 100}%,0,#fff2)`}}></input>
      </div>
      <AnimatedInput title = {props.name} placeholder = {sliderValue} onKeyUp = {inputFunc} onRef = {ref => setInput(ref)} className = 'handlingInput'/>
      <div className = 'handlingButtons'>
        <button onClick = {reset} className = 'AlternateColor' disabled = {parseInt(props.default) === parseInt(sliderValue)}>Reset</button>
        <button onClick = {save} disabled = {inital + '' === sliderValue + ''}>Save</button>
      </div>
    </Fragment>
  )
}

export default Settings;
