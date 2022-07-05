import React from 'react';

import CloseButton from 'react-bootstrap/CloseButton';
import { IoSettingsSharp } from 'react-icons/io5';
import Accordion from 'react-bootstrap/Accordion'
import { useAccordionButton } from 'react-bootstrap/AccordionButton';


import Handling from './handling.js'

import './settings.css';


const defaultState = {
    display:false
};

class Settings extends React.Component {
    constructor(props){
        super(props);
        this.state = Object.assign({},defaultState);


        this.displayDropDown = this.displayDropDown.bind(this);
        this.closeDropDown = this.closeDropDown.bind(this);
    }

    displayDropDown(){
        let copy = Object.assign({},this.state);
        copy.display = true;

        this.setState(copy);
    }

    closeDropDown(e){
        let defaultCopy = Object.assign({},defaultState);

        this.setState(defaultCopy);
    }

    renderForm(){
        return(
            <Handling />
        )
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
                                <Handling />
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Handling</Accordion.Header>
                                <Accordion.Body className = 'settings_accordion_body'>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                                veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                                commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                                velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                                cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                                est laborum.
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>

                        <button disabled={!this.state.formfilled} className = 'settings_submit' onClick = {this.submitInformation}>Save & Exit</button>
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
