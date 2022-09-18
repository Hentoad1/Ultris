import React from 'react';

import {AnimatedInput} from '../../../assets/components/animatedInput.js';
import CustomCheckbox from '../../../assets/components/customCheckbox';
import {InfoBox} from '../../../assets/components/customIcons.js';

import './handling.css';

const defaultHandling = {
    ARR:33,
    DAS:167,
    SDF:6,
    ISDF:false
}

class Handling extends React.Component {
    constructor(props){
        super(props); 
    }

    render() {
        return (
            <div className = 'handling'>
              <h1>Handling</h1>
              <AnimatedInput title = 'DAS' value = {2}>
                <InfoBox content = 'Delayed Auto Shift: The delay until your piece will start shifting when a direction is held down.'/>
              </AnimatedInput>
              <AnimatedInput title = 'ARR'>
                <InfoBox content = 'Auto Refresh Rate: The delay between shifts when DAS is held.'/>
              </AnimatedInput>
              <AnimatedInput title = 'SDF'>
                <InfoBox content = 'Soft Drop Factor: The factor soft drop will lower the piece by.'/>
              </AnimatedInput>
              <div className = 'row'>
                <CustomCheckbox className = 'checkbox'/>
                <span>Instant Soft Drop</span>
              </div>
              <div className = 'row'>
                <CustomCheckbox className = 'checkbox'/>
                <span>Measure with Frames</span>
              </div>
            </div>
        );
    }
}

export default Handling;
