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

/*class AnimatedInput extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            minimized:(props.value !== undefined)
        }

        this.updatePlaceholder = this.updatePlaceholder.bind(this);
        this.hidePlaceholder = this.hidePlaceholder.bind(this);

        this.ref = React.createRef();
    }
    
    componentDidMount(){
        if (this.props.onRef){
            this.props.onRef(this.ref);
        }
    }

    updatePlaceholder(e){
        if (e.target.value === ''){
            this.setState({minimized:false});
        }else{
            this.setState({minimized:true});
        }
    }

    hidePlaceholder(e){
        this.setState({minimized:true});
    }

    render() {
        let parentStyle = {
            background:this.props.background ?? null,
            color:this.props.color ?? null,
            '--iconColor':this.props.iconColor ?? null
        };
        return (
            <div className = 'AnimatedInput' style = {parentStyle} onBlur = {this.updatePlaceholder} onFocus = {this.hidePlaceholder}>
                <input ref = {this.ref} type = {this.props.type ?? 'text'} onKeyUp = {this.props.onKeyUp} defaultValue = {this.props.value}/>
                <span className = {this.state.minimized ? 'minimized' : ''}>{this.props.placeholder}</span>
                <div className = 'iconWrapper'>
                    {React.Children.map(this.props.children,(icon,key) => <div className = 'icon' key = {key}>{icon}</div>)}
                </div>
            </div>
        )
    }
}*/

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