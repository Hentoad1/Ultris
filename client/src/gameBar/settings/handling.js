import React from 'react';

import './handling.css';
import '../../global.css';


const initalState = {
    unit:'MS',
    unitFactor:1,
    ARR:{
        min:0,
        max:167,
        value:50,
        formattedValue:50,
        barFilled:0, //should be initalized when loaded
    },
    DAS:{
        min:0,
        max:334,
        value:50,
        formattedValue:50,
        barFilled:0, //should be initalized when loaded
    },
    DCD:{
        min:0,
        max:167,
        value:50,
        formattedValue:50,
        barFilled:0, //should be initalized when loaded
    },
    SDF:{
        min:0,
        max:20,
        value:5,
        formattedValue:5,
        barFilled:0, //should be initalized when loaded
        instant:false
    },
    
};

class Handling extends React.Component {
    constructor(props){
        super(props);
        this.state = Object.assign({},initalState);
        
        this.onSliderUpdate = this.onSliderUpdate.bind(this);
        this.onTextUpdate = this.onTextUpdate.bind(this);
        this.onPossbileSubmit = this.onPossbileSubmit.bind(this);
        this.recalculateSliders = this.recalculateSliders.bind(this);
        this.changeUnit = this.changeUnit.bind(this);
        this.updateSoftDrop = this.updateSoftDrop.bind(this);
    }

    onSliderUpdate(e){
        let target = e.target;
        let percentScrolled = (target.value - target.min) / (target.max - target.min);
        let value = percentScrolled * target.max;  

        let factor = target.id === 'SDF' ? 1 : this.state.unitFactor;

        console.log(this.state);

        let data = {
            value:value,
            formattedValue:this.formatValue(value, factor),
            barFilled:this.calculateBarFilled(target.min,target.max,target.value)
        };

        this.setState({[target.id]:data});
    }

    onTextUpdate(e){
        const validChars = '0123456789.';
        let target = e.target;
        let arr = e.target.value.split('');

        let result = arr.filter((e,i) => validChars.includes(e) && i < 4);

        e.target.value = result.length === 0 ? '' : result.join('');
    }

    onPossbileSubmit(e){
        if (e.key === 'Enter' && e.target.value !== ''){
            let target = e.target;
            let stats = this.state[target.id];
            
            let factor = target.id === 'SDF' ? 1 : this.state.unitFactor;
            let input = target.value / factor;

            let value = Math.max(stats.min,Math.min(stats.max,input));

            let data = {
                value:value,
                formattedValue:this.formatValue(value, factor),
                barFilled:this.calculateBarFilled(target.min,target.max,target.value)
            };

            target.value = '';

            this.setState({[target.id]:data});
        }
    }

    recalculateSliders(copy = Object.assign({},this.state)){
        const sections = ['ARR','DAS','DCD'];
        let factor = copy.unitFactor;

        for (let i = 0; i < sections.length; i++){
            let stats = copy[sections[i]];
            stats.formattedValue = this.formatValue(stats.value,factor);
        }

        this.setState(copy);
    }

    changeUnit(e){
        let copy = Object.assign({},this.state);
        if (e.target.checked){
            copy.unit = 'F';
            copy.unitFactor = 0.06;
        }else{
            copy.unit = 'MS';
            copy.unitFactor = 1;
        }
        this.recalculateSliders(copy);
    }

    updateSoftDrop(e){
        this.setState({SDF:{instant:e.target.checked}});
    }

    formatValue(value, factor = this.state.unitFactor){
        console.log(factor);
        if (factor === 1){
            return Math.floor(value);
        }else{
            return Math.floor(value * factor * 10) / 10;
        }
    }

    calculateBarFilled(min,max,value){
        let percentScrolled = (value - min) / (max - min);
        let barFilled = (1 - percentScrolled) * 100;
        return barFilled;
    }

    componentDidMount(){
        const sections = ['ARR','DAS','DCD','SDF'];
        let copy = Object.assign({},this.state);

        for (let i = 0; i < sections.length; i++){
            let stats = copy[sections[i]];
            stats.barFilled = this.calculateBarFilled(stats.min,stats.max,stats.value);
        }

        this.setState(copy);
    }

    render() {
        return (
            <React.Fragment>
                <div className = 'handling_section'>
                    ARR
                    <input style = {{background: 'linear-gradient(90deg,white ' + this.state.ARR.barFilled + '%,0,#FFFFFF44)'}} id = 'ARR' type = 'range' dir = 'rtl' min = '0' step = '1' max = '167' className = 'handling_slider' value = {this.state.ARR.value} onChange = {this.onSliderUpdate}/>
                    <div className = 'grow'></div>
                    <input id = 'ARR' type = "text" autoComplete="off" className = 'handling_input' placeholder = {this.state.ARR.formattedValue} onInput = {this.onTextUpdate} onKeyUp = {this.onPossbileSubmit}/>
                    <div className = 'handling_unit'>{this.state.unit}</div>
                </div>
                <div className = 'handling_section'>
                    DAS
                    <input style = {{background: 'linear-gradient(90deg,white ' + this.state.DAS.barFilled + '%,0,#FFFFFF44)'}} id = 'DAS' type = 'range' dir = 'rtl' min = '0' step = '1' max = '334' className = 'handling_slider' value = {this.state.DAS.value} onChange = {this.onSliderUpdate}/>
                    <div className = 'grow'></div>
                    <input id = 'DAS' type = "text" autoComplete="off" className = 'handling_input' placeholder = {this.state.DAS.formattedValue} onInput = {this.onTextUpdate} onKeyUp = {this.onPossbileSubmit}/>
                    <div className = 'handling_unit'>{this.state.unit}</div>
                </div>
                <div className = 'handling_section'>
                    DCD
                    <input style = {{background: 'linear-gradient(90deg,white ' + this.state.DCD.barFilled + '%,0,#FFFFFF44)'}} id = 'DCD' type = 'range' dir = 'rtl' min = '0' step = '1' max = '167' className = 'handling_slider' value = {this.state.DCD.value} onChange = {this.onSliderUpdate}/>
                    <div className = 'grow'></div>
                    <input id = 'DCD' type = "text" autoComplete="off" className = 'handling_input' placeholder = {this.state.DCD.formattedValue} onInput = {this.onTextUpdate} onKeyUp = {this.onPossbileSubmit}/>
                    <div className = 'handling_unit'>{this.state.unit}</div>
                </div>
                <div className = {'handling_section' + (this.state.SDF.instant ? ' handling_disabled' : '')}>
                    SDF
                    <input style = {{background: 'linear-gradient(270deg,#FFFFFF44 ' + this.state.SDF.barFilled + '%,0,white)'}} id = 'SDF' type = 'range' min = '1' step = '1' max = '20' className = 'handling_slider' value = {this.state.SDF.value} onChange = {this.onSliderUpdate} disabled = {this.state.SDF.instant}/>
                    <div className = 'grow'></div>
                    <input id = 'SDF' type = "text" autoComplete="off" className = 'handling_input' placeholder = {this.state.SDF.formattedValue} onInput = {this.onTextUpdate} onKeyUp = {this.onPossbileSubmit} disabled = {this.state.SDF.instant}/>
                    <div className = 'handling_unit'>X</div>
                </div>
                <div className = 'handling_section'>
                    USE FRAMES
                    <div className = 'grow'></div>
                    <input className = 'handling_checkbox' type = 'checkbox' onInput = {this.changeUnit}/>
                </div>
                <div className = 'handling_section'>
                    INSTANT SOFTDROP
                    <div className = 'grow'></div>
                    <input className = 'handling_checkbox' type = 'checkbox' onInput = {this.updateSoftDrop}/>
                </div>
                <span className = 'handling_logged_warning' style = {{display : this.props.loggedIn ? 'none' : null}}>Because you are not logged in, your settings will not be saved.</span>
            </React.Fragment>
        );
    }
}
  
export default Handling;
