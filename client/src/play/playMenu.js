import React from 'react';
import { Link } from 'react-router-dom';

import './playMenu.css';


const defaultState = {

};

class PlayMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;
    }

    render() {
        return (
            <div>
                <Link to = "sprint">sprint</Link>
            </div>
        )
    }
}

export default PlayMenu;
