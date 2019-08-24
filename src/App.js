import React from 'react';
import logo from './logo.svg';
import './App.css';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import Navbar.Toggle from 'react-bootstrap/NavbarToggle';
import Navbar.Brand from 'react-bootstrap/NavbarBrand';
import Nav.Link from 'react-bootstrap/NavLink';
import Nav.Dropdown from 'react-bootstrap/NavDropdown';

class MyThing extends React.Component {
  constructor(props) {
    super(props);
    this.showEditor = this.showEditor.bind(this);
    this.state = {
	currentValue: "Bye",
	toggled: false

    };
  }
  showEditor() {
	this.setState({toggled: true});	
  }
  render() {
    let field;
    if (!this.state.toggled) { field = <span>{this.state.currentValue}</span> }
    if (this.state.toggled) {  field = <input type="text"></input> }
    return (
	<div onClick={this.showEditor}>
	    {field}
		<Button>Submit</Button>
	 </div>
    )
  }
}

function App() {
  return (
    <div className="App">
	<Navbar bg="light" expand="lg">
  <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
  <Navbar.Toggle aria-controls="basic-navbar-nav" />
  <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mr-auto">
      <Nav.Link href="#home">Home</Nav.Link>
      <Nav.Link href="#link">Link</Nav.Link>
      <NavDropdown title="Dropdown" id="basic-nav-dropdown">
        <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
        <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
      </NavDropdown>
    </Nav>
    <Form inline>
      <FormControl type="text" placeholder="Search" className="mr-sm-2" />
      <Button variant="outline-success">Search</Button>
    </Form>
  </Navbar.Collapse>
</Navbar>
	
	
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Redeploy3 <code>src/App.js</code> and save to reload.
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
