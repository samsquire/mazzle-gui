import React from 'react';
import logo from './logo.svg';
import './App.css';

class MyThing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
	currentValue: "Bye"
    };
  }
  render() {
    return (
	<div>
	 {this.state.currentValue}
	 </div>
    )
  }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          works from windows <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
	<MyThing></MyThing>
      </header>
    </div>
  );
}

export default App;
