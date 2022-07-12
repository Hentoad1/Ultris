import React from 'react';
import {forwardRef, useImperativeHandle, useRef} from 'react';


import CloseButton from 'react-bootstrap/CloseButton';
import { IoSettingsSharp } from 'react-icons/io5';
import Accordion from 'react-bootstrap/Accordion'
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import Handling from './handling.js'
import Keybinds from './keybinds.js'

import './settings.css';
import { toHaveDisplayValue } from '@testing-library/jest-dom/dist/matchers.js';


const defaultState = {
    display:false
};

class Settings extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.updateKeybinds = React.createRef();
        this.updateHandling = React.createRef();


        this.displayDropDown = this.displayDropDown.bind(this);
        this.closeDropDown = this.closeDropDown.bind(this);
        this.submitInformation = this.submitInformation.bind(this);
    }

    displayDropDown(){
        this.setState({display : true});
    }

    closeDropDown(){
        this.setState(defaultState);
    }

    submitInformation(){
        this.updateHandling.current.saveToCookie();
        this.updateKeybinds.current.saveToCookie();

        this.setState(defaultState);
    }

    render() {
        if (this.state.display){
            return (
                <React.Fragment>
                <div className = {this.props.className} onClick = {this.displayDropDown}>
                    <IoSettingsSharp />
                </div>
                <div className = 'settings_outer'>
                    <div className = 'settings_inner'>
                        <div className = 'settings_close_button'>
                            <CloseButton variant = 'white' onClick = {this.closeDropDown}/>
                        </div>

                        <header className = 'settings_head'>Settings</header>

                        <Accordion defaultActiveKey="0" flush className = 'settings_accordion'>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Keybinds</Accordion.Header>
                                <Accordion.Body className = 'settings_accordion_body'>
                                <Keybinds loggedIn = {this.props.loggedIn} ref = {this.updateKeybinds}/>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Handling</Accordion.Header>
                                <Accordion.Body className = 'settings_accordion_body'>
                                <Handling loggedIn = {this.props.loggedIn} ref = {this.updateHandling}/>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                        <button disabled={this.state.formfilled} className = 'settings_submit' onClick = {this.submitInformation}>Save & Exit</button>
                    </div>
                </div>
                </React.Fragment>
            );
        }else{
            return(
                <div className = {this.props.className} onClick = {this.displayDropDown}>
                    <IoSettingsSharp />
                </div>
            )
        }
    }
}
  
export default Settings;
