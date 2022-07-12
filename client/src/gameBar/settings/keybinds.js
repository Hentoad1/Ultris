import React from 'react';
import Cookies from 'universal-cookie';

import './keybinds.css';
import '../../global.css';


const defaultControls = {
    exit:'Escape',
    reset:'r',
    left:'ArrowLeft',
    right:'ArrowRight',
    soft:'ArrowDown',
    rotate90:'ArrowUp',
    rotate180:'a',
    rotate270:'z',
    hold:'c',
    hard:' ',
}

const initalState = {
    rebindOverlay:false,
    controlBeingSet:null
};

class Keybinds extends React.Component {
    constructor(props){
        super(props);
        const cookies = new Cookies();



        let initalControls = cookies.get('controls') || defaultControls;
        let controls = {};
        for (let control in initalControls){
            let key = initalControls[control];
            controls[control] = {
                key:key,
                formatted:this.formatKey(key)
            }
        }

        let startingState = Object.assign({},initalState);
        startingState.controls = controls;
        startingState.initalControls = controls;

        this.state = startingState;

        
        this.rebind = this.rebind.bind(this);
        this.setControl = this.setControl.bind(this);
        this.reset = this.reset.bind(this);
    }

    rebind(e){
        e.target.blur();
        let cntl = e.target.getAttribute('control');
        this.setState({rebindOverlay:true,keyBeingSet:cntl});
    }
    
    setControl(e){
        if (this.state.rebindOverlay){
            let key;
            if (e.key === undefined){ //key is only undefined on a mouse event => screen was clicked
                key = null;
            }else{
                key = e.key;
            }

            let controlCopy = Object.assign({},this.state.controls);

            controlCopy[this.state.keyBeingSet] = {
                key:key,
                formatted:this.formatKey(key)
            }

            let data = {
                rebindOverlay:false,
                controls:controlCopy
            };

            this.setState(data);
            
        }
    }

    reset(){
        let controls = {};
        for (let control in defaultControls){
            let key = defaultControls[control];
            controls[control] = {
                key:key,
                formatted:this.formatKey(key)
            }
        }
        this.setState({controls:controls});
    }

    formatKey(key){
        if (key === null){
            return '<UNBOUND>';
        }else if (key === ' '){
            return 'SPACE'; 
        }else{
            return key.toUpperCase();
        }
    }

    saveToCookie(){
        let data = {};

        for (let control in this.state.controls){
            data[control] = this.state.controls[control].key;
        }
        const cookies = new Cookies();
        cookies.set('controls', data, { path: '/' });
    }

    componentDidMount(){
        document.addEventListener("keyup", this.setControl, false);
    }

    componentWillUnmount(){
        document.removeEventListener("keyup", this.setControl, false);
    }

    render() {
        let overlay = '';
        if (this.state.rebindOverlay){
            overlay = 
            <div className = 'keybinds_overlay' onClick={this.setControl}>
                <span className = 'keybinds_main_header'>Press any key to rebind it.</span>
                <span className = 'keybinds_sub_header'>Click anywhere to unbind the key.</span>
            </div>
        }
        return (
            <React.Fragment>
                {overlay}
                <ul className = 'keybinds_list'>
                    <li>EXIT <button control = 'exit' onClick = {this.rebind}>{this.state.controls.exit.formatted}</button></li>
                    <li>RESET <button control = 'reset' onClick = {this.rebind}>{this.state.controls.reset.formatted}</button></li>
                    <li>LEFT <button control = 'left' onClick = {this.rebind}>{this.state.controls.left.formatted}</button></li>
                    <li>RIGHT <button control = 'right' onClick = {this.rebind}>{this.state.controls.right.formatted}</button></li>
                    <li>SOFT DROP <button control = 'soft' onClick = {this.rebind}>{this.state.controls.soft.formatted}</button></li>
                    <li>ROTATE (90) <button control = 'rotate90' onClick = {this.rebind}>{this.state.controls.rotate90.formatted}</button></li>
                    <li>ROTATE (180) <button control = 'rotate180' onClick = {this.rebind}>{this.state.controls.rotate180.formatted}</button></li>
                    <li>ROTATE (270) <button control = 'rotate270' onClick = {this.rebind}>{this.state.controls.rotate270.formatted}</button></li>
                    <li>HOLD <button control = 'hold' onClick = {this.rebind}>{this.state.controls.hold.formatted}</button></li>
                    <li>HARD DROP <button control = 'hard' onClick = {this.rebind}>{this.state.controls.hard.formatted}</button></li>
                </ul>
                <button className = 'keybinds_default_button' onClick = {this.reset}>Reset to Default</button>
            </React.Fragment>
        );
    }
}
  
export default Keybinds;
