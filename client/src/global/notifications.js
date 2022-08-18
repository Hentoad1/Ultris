import React from 'react';
import './notifications.css';

import Context from './context.js';

import {ReactComponent as Checkmark} from '../assets/svgs/Checkmark.svg';
import {ReactComponent as Warning} from '../assets/svgs/Warning.svg';

class NotificationWrapper extends React.Component {
    constructor(props){
        super(props);
        this.state = {notifications:[],totalMessages:0};

        this.addNotification = this.addNotification.bind(this);
        this.removeNotification = this.removeNotification.bind(this);
    }

    static contextType = Context;

    componentDidMount(){
      this.context.createNotification = this.addNotification;
    }

    addNotification(content,type,time){
      let notifications = this.state.notifications;
      let totalMessages = this.state.totalMessages;

      notifications.push(<Notification content = {content} key = {totalMessages++} removeNotification = {this.removeNotification} type = {type} time = {time}/>);
      this.setState({notifications,totalMessages});
    }

    removeNotification(){
      let notifications = this.state.notifications;
      
      notifications.shift();
      this.setState({notifications});
    }

    render() {
      return (
        <React.Fragment>
          <div className = 'notificationWrapper'>
            {this.state.notifications}
          </div>
        </React.Fragment>
      )
    }
}

class Notification extends React.Component {
  render(){
    let icon = <Warning/>;
    let color = '#ff0000';
    if (this.props.type === 'success'){
      icon = <Checkmark/>;
      color = '#00ff00';
    }
    return (
      <div className = 'notification' onAnimationEnd = {this.props.removeNotification} style = {{'--PrimaryColor':color,'--AnimationTime':(this.props.time ?? 5) + 's'}}>
        {icon}
        <span>
          {this.props.content}
        </span>
      </div>
    )
  }
}

export {NotificationWrapper as Notifcations};
