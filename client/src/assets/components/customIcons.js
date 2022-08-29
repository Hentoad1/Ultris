import React from 'react';

import {ReactComponent as Info} from '../../assets/svgs/Info.svg';

import './customIcons.css';

class InfoBox extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            display:false
        }
    }

    render() {
        let dropdown = this.state.display ?
        <div className = 'dropdown'>
            {this.props.content}
        </div>
        : null;

        return (
            <div className = 'InfoBox' onMouseEnter = {() => this.setState({display:true})} onMouseLeave = {() => this.setState({display:false})}>
                <Info/>
                {dropdown}
            </div>
        )
    }
}


export {InfoBox};