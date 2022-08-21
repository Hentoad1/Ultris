import React from 'react';

import {ReactComponent as TextHidden} from '../../assets/svgs/Text_Hidden.svg';
import {ReactComponent as TextVisible} from '../../assets/svgs/Text_Visible.svg';

import './animatedInput.css';

class AnimatedInput extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            minimized:false
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
                <input ref = {this.ref} type = {this.props.type ?? 'text'} onKeyUp = {this.props.onKeyUp}/>
                <span className = {this.state.minimized ? 'minimized' : ''}>{this.props.placeholder}</span>
                <div className = 'iconWrapper'>
                    {(this.props.children ?? []).map((icon, key) => 
                        icon === undefined ? null : <div className = 'icon' key = {key}>
                            {icon}
                        </div>
                    )}
                </div>
            </div>
        )
    }
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
        <TextVisible onClick = {this.updateIcon}/> : 
        <TextHidden onClick = {this.updateIcon}/>;

        return (
            <AnimatedInput type = {this.state.showingText ? 'text' : 'password'} onKeyUp = {this.props.onKeyUp} placeholder = {this.props.placeholder} onRef = {this.props.onRef} color = {this.props.style} background = {this.props.background} iconColor = {this.props.iconColor}>
                {svg}
                {this.props.children}
            </AnimatedInput>
        )
    }
}

export {AnimatedInput, AnimatedPasswordInput};