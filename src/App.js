import React from 'react';
import logo from './logo.svg';
import './App.css';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Card from 'react-bootstrap/FormControl';

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
	<Navbar bg="light" expand="lg" fixed="top" sticky="top">
  <Navbar.Brand href="#home">Sam Squire</Navbar.Brand>
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
		<Card style={{ width: '18rem' }}>
  <Card.Body>
    <Card.Title>Card Title</Card.Title>
    <Card.Text>
      Some quick example text to build on the card title and make up the bulk of
      the card's content.
    </Card.Text>
    <Button variant="primary">Go somewhere</Button>
  </Card.Body>
</Card>
      <header className="App-header">
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
