import React from 'react';
import CloseButton from 'react-bootstrap/CloseButton';
import { IoSettingsSharp } from 'react-icons/io5';
import './settings.css';
import './customSwitch.css';


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
            <React.Fragment>
            <header className = 'settings_head'>Handling</header>
            <label htmlFor = 'username' className = 'settings_label'>Username</label>
            <input id = 'username' type = "text" className = 'settings_input' onInput = {this.updateInputFilled} onBlur = {this.updateUsernameValidity}></input>
            <span className = 'settings_error'>{this.state.usernameError}</span>
            <label htmlFor = 'password'  className = 'settings_label'>Password</label>
            <input id = 'password' type = "password" className = 'settings_input' onInput = {this.updateInputFilled} onBlur = {this.updatePasswordValidity}></input>
            <label htmlFor = 'passwordConfirm'  className = 'settings_label'>Confirm Password</label>
            <input id = 'passwordConfirm' type = "password" className = 'settings_input' onInput = {this.updateInputFilled} onBlur = {this.updatePasswordValidity}></input>
            <span className = 'settings_error'>{this.state.passwordError}</span>
            <label htmlFor = 'email'  className = 'settings_label'>Email (Optional)</label>
            <input id = 'email' type="text" className = 'settings_input' onInput = {this.updateInputFilled} onBlur = {this.updateEmailValidity}></input>
            <span className = 'settings_error'>{this.state.emailError}</span>
            <span className = 'settings_error'>{this.state.serverError}</span>
            </React.Fragment>
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
                        <CloseButton variant = 'white' onClick = {this.closeDropDown}/>
                        <div className = 'settings_toggle'>
                            <label className = 'switch_vertical'>
                                <input type = 'checkbox' className = 'checkbox_vertical'/>
                                <span className = 'slider_vertical'></span>
                            </label>
                        </div>

                        {this.renderForm()}
                        <button disabled={!this.state.formfilled} className = 'settings_submit' onClick = {this.submitInformation}>Save</button>
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
