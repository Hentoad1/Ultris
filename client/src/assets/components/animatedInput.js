import React, {useRef, useEffect, useState} from 'react';

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

  let minimized = focused || value !== '';
  let parentStyle = {
      background:props.background ?? null,
      color:props.color ?? null,
      '--iconColor':props.iconColor ?? null
  };
  return (
    <div className = 'AnimatedInput' style = {parentStyle} onBlur = {() => setFocused(false)} onFocus = {() => setFocused(true)}>
        <input ref = {ref} type = {props.type ?? 'text'} onKeyUp = {props.onKeyUp} defaultValue = {props.value} onInput = {e => setValue(e.target.value)}/>
        <span className = {minimized ? 'minimized' : ''}>{props.placeholder}</span>
        <div className = 'iconWrapper'>
            {React.Children.map(props.children,(icon,key) => <div className = 'icon' key = {key}>{icon}</div>)}
        </div>
    </div>
  )
}

class AnimatedPasswordInput extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            showingText:false
        }

        this.updateIcon = this.updateIcon.bind(this);
    }

    updateIcon(e){
        this.setState({showingText:!this.state.showingText});
    }

    render() {
        let svg = this.state.showingText ? 
        <TextVisible onClick = {this.updateIcon} key = {0}/> : 
        <TextHidden onClick = {this.updateIcon} key = {0}/>;

        let icons = [svg];

        React.Children.forEach(this.props.children,e => icons.push(e));

        return (
            <AnimatedInput type = {this.state.showingText ? 'text' : 'password'} onKeyUp = {this.props.onKeyUp} placeholder = {this.props.placeholder} onRef = {this.props.onRef} color = {this.props.style} background = {this.props.background} iconColor = {this.props.iconColor}>
                {icons}
            </AnimatedInput>
        )
    }
}

export {AnimatedInput, AnimatedPasswordInput};