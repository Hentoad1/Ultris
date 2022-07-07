import React from 'react';

import './keybinds.css';
import '../../global.css';


const initalState = {
    rebindOverlay:false,
    keyBeingSet:null,
    controls:{
        exit:'Escape'
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
        this.setState({rebindOverlay:true,keyBeingSet:e.target.key});
    }
    
    overlayKeyPressed(e){
        if (this.state.rebindOverlay){
            console.log(e);
        }
    }

    overlayClicked(e){

    }

    componentDidMount(){
        document.addEventListener("keyup", this.overlayKeyPressed, false);
    }

    componentWillUnmount(){
        document.removeEventListener("keyup", this.overlayKeyPressed, false);
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
                    <li>EXIT <button key = 'exit' onClick = {this.rebind}>{this.state.controls.exit}</button></li>
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
