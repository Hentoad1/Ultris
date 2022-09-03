import React from 'react';

import './controls.css';

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
const joinedDefault = Object.values(defaultControls).join();

class Controls extends React.Component {
    constructor(props){
        super(props);

        let controls = JSON.parse(localStorage.getItem('controls') ?? JSON.stringify(defaultControls));

        this.state = {
            controls,
            popup:null,
            inital:Object.assign({},controls)
        }

        this.rebind = this.rebind.bind(this);
        this.save = this.save.bind(this);
    }

    rebind(keyName, displayName){
        let keyListener = function(e){
            window.removeEventListener('keyup',keyListener,false);
            
            if (e.key === undefined){
                let controls = this.state.controls;
                controls[keyName] = '';
                this.setState({popup:null,controls});
            }else{
                let controls = this.state.controls;
                controls[keyName] = e.key;
                this.setState({popup:null,controls});
            }

        }.bind(this);

        window.addEventListener('keyup',keyListener,false);

        let popup = 
        <div className = 'popup' onClick = {keyListener}>
            <h1>PRESS ANY KEY TO REBIND</h1>

            <span>CLICK ANYWHERE TO UNBIND</span>
        </div>
        
        this.setState({popup});
    }

    save(){
        localStorage.setItem('controls', JSON.stringify(this.state.controls));
        this.setState({inital:Object.assign({},this.state.controls)});
    }

    render() {
        let ctrlsMatchDefault = Object.values(this.state.controls).join() === joinedDefault;
        let ctrlsMatchInitial = Object.values(this.state.controls).join() === Object.values(this.state.inital).join()

        return (
            <div className = 'controls'>
                <h1>Game Controls</h1>
                <ul>
                    {format(this.state.controls).map(([keyName, displayName, control],i) => 
                    <li key = {i} onClick = {e => this.rebind(keyName,displayName,e)}>
                        <span>{displayName}</span>
                        <span>{control}</span>
                    </li>
                    )}
                </ul>

                <button className = 'AlternateColor' onClick = {() => this.setState({controls:Object.assign({},defaultControls)})} disabled = {ctrlsMatchDefault}>Set to Default</button>
                <button disabled = {ctrlsMatchInitial} onClick = {this.save}>Save</button>
                {this.state.popup}
            </div>
        );
    }
}

const controlNames = {
    exit:'Exit',
    reset:'Reset',
    left:'Left',
    right:'Right',
    soft:'Soft Drop',
    rotate90:'Rotate 90 Degrees',
    rotate180:'Rotate 180 Degrees',
    rotate270:'Rotate 270 Degrees',
    hold:'Hold',
    hard:'Hard Drop',
}

const keyNames = {
    ' ':'Space',
    ArrowLeft:'Left Arrow',
    ArrowRight:'Right Arrow',
    ArrowUp:'Up Arrow',
    ArrowDown:'Down Arrow',
}

function format(object){
    return Object.entries(object).map(function([name, control],i){
        if (control === null){ //format control
            control = '';
        }else if (keyNames[control] !== undefined){
            control = keyNames[control];
        }else if (control.length === 1){
            control = control.toUpperCase();
        }

        return (
            [name, controlNames[name], control]
        )
    });
}

export default Controls;
