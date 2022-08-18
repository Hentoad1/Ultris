import React from 'react';

const Context = React.createContext();

class ContextWrapper extends React.Component{
  render(){
    return (
      <Context.Provider value = {{}}>
        {this.props.children}
      </Context.Provider>
    );
  }
}

export {ContextWrapper};

export default Context;