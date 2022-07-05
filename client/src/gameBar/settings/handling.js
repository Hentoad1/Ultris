import React from 'react';
import CloseButton from 'react-bootstrap/CloseButton';
import './handling.css';


const initalState = {
    unit:'MS',
    ARR:{
        value:50,
        formattedValue:50
    }
};

class Handling extends React.Component {
    constructor(props){
        super(props);
        this.state = Object.assign({},initalState);
        
        this.onSliderUpdate = this.onSliderUpdate.bind(this);
    }

    onSliderUpdate(e){
        let target = e.target;
        let percentScrolled = (target.value - target.min) / (target.max - target.min);
        let value = percentScrolled * target.max;  

        let formattedValue = Math.floor(value * 10) / 10;

        target.style.background = 'linear-gradient(90deg,white ' + ((1 - percentScrolled) * 100 + '%') + ',0,#FFFFFF44)';

        let copy = Object.assign({},this.state);
        copy[target.id].value = value;
        copy[target.id].formattedValue = formattedValue;
        this.setState(copy);
        
    }

    render() {
        return (
            <React.Fragment>
                <div className = 'handling_section'>
                    ARR
                    <input id = 'ARR' type = 'range' dir = 'rtl' min = '0' step = '1' max = '167' className = 'handling_slider' onChange = {this.onSliderUpdate}/>
                    <input type = "text" autoComplete="off" className = 'handling_input' placeholder = {this.state.ARR.formattedValue}/>
                </div>
                <div className = 'handling_section'>
                    DAS
                    <input type = 'range' dir = 'rtl' min = '0' step = '1' max = '334' className = 'handling_slider'/>
                    <input type = "text" autoComplete="off" className = 'handling_input'/>
                </div>
                <div className = 'handling_section'>
                    DCD
                    <input type = 'range' dir = 'rtl' min = '0' step = '1' max = '167' className = 'handling_slider'/>
                    <input type = "text" autoComplete="off" className = 'handling_input'/>
                </div>
                <div className = 'handling_section'>
                    SDF
                    <input type = 'range' min = '1' step = '1' max = '20' className = 'handling_slider'/>
                    <input type = "text" autoComplete="off" className = 'handling_input'/>
                </div>
            </React.Fragment>
        );
    }
}
  
export default Handling;
