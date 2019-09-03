import React from 'react';
import logo from './logo.svg';
import './App.css';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Card from 'react-bootstrap/Card';
import Breadcrumb from 'react-bootstrap/Breadcrumb';



class MyThing extends React.Component {
  constructor(props) {
    super(props);
    this.showEditor = this.showEditor.bind(this);
	this.handleUsernameChange = this.handleUsernameChange.bind(this);
	this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.state = {
		currentValue: "Bye",
		toggled: false,
		username: "",
		password: ""
    };
  }
  
  handleSubmit(event) {
	  console.log("sign in");
	  event.preventDefault();
  }
  
  showEditor() {
	this.setState({toggled: true});	
  }
	  
	handleUsernameChange(event) {
		this.setState({username: event.target.value});
	  }
	  
	    
	handlePasswordChange(event) {
		this.setState({password: event.target.value});
	  }
	  
  render() {
    return (
	<Form inline="true"  onSubmit={this.handleSubmit}>
 <Form.Group controlId="formBasicEmail">
    <Form.Control type="email" placeholder="Enter email" onChange={this.handleUsernameChange} value={this.state.username} />
    <Form.Control type="password" placeholder="Password" onChange={this.handlePasswordChange} value={this.state.password} />
	  <Button variant="primary" type="submit">
    Submit
  </Button>
  </Form.Group>
  </Form>

    )
  }
}



function App() {
  return (
	<div className="App">
	<Navbar bg="light" expand="lg" fixed="top" sticky="top">
  <Navbar.Brand href="#home">devops-pipeline</Navbar.Brand>
  <Navbar.Toggle aria-controls="basic-navbar-nav" />
  <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mr-auto">
      <Nav.Link href="#home">Home</Nav.Link>
      <Nav.Link href="#link">Builds</Nav.Link>
      <NavDropdown title="Dropdown" id="basic-nav-dropdown">
        <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
        <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
      </NavDropdown>
    </Nav>
	
	<MyThing></MyThing>
	
 

  </Navbar.Collapse>
</Navbar>
<Breadcrumb>
  <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
  <Breadcrumb.Item href="https://getbootstrap.com/docs/4.0/components/breadcrumb/">
    Library
  </Breadcrumb.Item>
  <Breadcrumb.Item active>Data</Breadcrumb.Item>
</Breadcrumb>
	
	<Nav className="col-md-2 d-none d-md-block sidebar bg-light" sidebar="">
	<Nav.Link href="#home">Home</Nav.Link>
      <Nav.Link href="#link">Builds</Nav.Link>
	</Nav>
		
    </div>
  );
}

export default App;
