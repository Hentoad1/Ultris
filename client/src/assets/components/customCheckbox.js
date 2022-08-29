import React from 'react';

import {ReactComponent as Checkmark} from '../../assets/svgs/Basic_Checkmark.svg';

import './customCheckbox.css';

class CustomCheckbox extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            minimized:false
        }
    }

    render() {
        return (
            <div className = {'CustomCheckbox ' + (this.props.className ?? '')} style = {this.props.style}>
                <input type = 'checkbox' onInput = {this.props.onInput ?? null}/>
                <span/>
                <Checkmark/>
            </div>
        )
    }
}


export default CustomCheckbox;