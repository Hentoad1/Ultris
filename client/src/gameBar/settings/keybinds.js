import React from 'react';

import './keybinds.css';
import '../../global.css';


const initalState = {
    rebindOverlay:false,
    controlBeingSet:null,
    controls:{
        exit:'Escape'
    },
    formattedControls:{
        exit:'ESCAPE'
    }
};

class Keybinds extends React.Component {
    constructor(props){
        super(props);
        this.state = Object.assign({},initalState);

        this.rebind = this.rebind.bind(this);
        this.overlayKeyPressed = this.overlayKeyPressed.bind(this);
        this.overlayClicked = this.overlayClicked.bind(this);
    }

    rebind(e){
        e.target.blur();
        let cntl = e.target.getAttribute('controlbutton');
        this.setState({rebindOverlay:true,keyBeingSet:cntl});
    }
    
    overlayKeyPressed(e){
        if (this.state.rebindOverlay){
            let data = {
                rebindOverlay:false,
                controls:{[this.state.keyBeingSet]:e.key},
                formattedControls:{[this.state.keyBeingSet]:this.formatKey(e.key)}
            };

            this.setState(data);

            console.log(e);
        }
    }

    overlayClicked(e){
        if (this.state.rebindOverlay){
            let data = {
                rebindOverlay:false,
                controls:{[this.state.keyBeingSet]:null},
                formattedControls:{[this.state.keyBeingSet]:this.formatKey(null)}
            };

            this.setState(data);

            console.log(e);
        }
    }

    componentDidMount(){
        document.addEventListener("keyup", this.overlayKeyPressed, false);
    }

    componentWillUnmount(){
        document.removeEventListener("keyup", this.overlayKeyPressed, false);
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

    render() {
        let overlay = '';
        if (this.state.rebindOverlay){
            overlay = <div className = 'keybinds_overlay' onClick={this.overlayClicked}>test</div>
        }
        return (
            <React.Fragment>
                {overlay}
                <ul className = 'keybinds_list'>
                    <li>EXIT <button controlbutton = 'exit' onClick = {this.rebind}>{this.state.formattedControls.exit}</button></li>
                    <li>RESET</li>
                    <li>LEFT</li>
                    <li>RIGHT</li>
                    <li>SOFT DROP</li>
                    <li>ROTATE (90)</li>
                    <li>ROTATE (180)</li>
                    <li>ROTATE (270)</li>
                    <li>HOLD</li>
                    <li>HARD DROP</li>
                </ul>
            </React.Fragment>
        );
    }
}
  
export default Keybinds;
