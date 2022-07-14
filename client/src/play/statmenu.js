import React from 'react';
import './statmenu.css';

const defaultState = {
    display:false,
    displayMinors:true,
    primaryStat:'',
    primaryStatValue:'',
    secondaryStats:'',
};

class StatMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;
    }

    update(stats){
        console.log(stats);
        this.setState(stats);
    }

    render() {


        return (




            <div className = {'statMenu ' + (this.state.display ? 'visible' : 'hidden')}>
                <span>{this.state.primaryStat}</span>
                <span>{this.state.primaryStatValue}</span>
                <ul id = "minorStats" className = "minorStats" style = {{display:this.state.displayMinors ? null : 'none'}}>
                    {typeof this.state.secondaryStats === Array ? this.state.secondaryStats.map(x => <li>{x.title}: {x.value}</li>) : ''}
                    <li>LEVEL: <span></span></li>
                    <li>LINES: <span></span></li>
                    <li>SINGLES: <span></span></li>
                    <li>DOUBLES: <span></span></li>
                    <li>TRIPLES: <span></span></li>
                    <li>QUADS: <span></span></li>
                    <li>T-SPIN SINGLES: <span></span></li>
                    <li>T-SPIN DOUBLES: <span></span></li>
                    <li>T-SPIN TRIPLES: <span></span></li>
                    <li>T-SPIN MINI SINGLES: <span></span></li>
                    <li>T-SPIN MINI DOUBLES: <span></span></li>
                    <li>ALL CLEARS: <span></span></li>
                    <li>LARGEST B2B STREAK: <span></span></li>
                </ul>
                <span id = 'restartInfo'>
                PRESS R TO RESTART<br/>
                PRESS ESC TO EXIT TO MENU
                </span>
            </div>
        )
    }
}
  
export default StatMenu;
