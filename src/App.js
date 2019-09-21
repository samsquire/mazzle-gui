import React from 'react';
import ReactDOM from 'react-dom';
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
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ProgressBar from 'react-bootstrap/ProgressBar'
import { createStore, combineReducers } from 'redux';
import io from 'socket.io-client';

const INITIAL_STATE = {
	latest: [],
	pipeline: [],
	components: [],
	running: [],
	environments: []
};
const INIT = 'INIT';
const BUILD_CHANGING = 'BUILD_CHANGING';
const PROGRESS = 'PROGRESS';
const COMMAND_RUN = 'COMMAND_RUN';
const COMMAND_FINISH = 'COMMAND_FINISH';
const RUNNING = 'RUNNING';
const LATEST = 'LATEST';
const UPDATE = 'UPDATE';

function buildChanging(name, command) {
	return {
		type: 'BUILD_CHANGING',
		name: name,
		command: command
	};
}

function progress(name, progress) {
	return {
		type: 'PROGRESS',
		name: name,
		progress: progress
	};
}

function appReducer(state = INITIAL_STATE, action) {
	switch(action.type) {

		case COMMAND_FINISH:
			var newState = Object.assign({}, state);
			newState.running = newState.running.filter((item) => {
				if (item.reference == action.reference) {
					return false;
				} else {
					return true;
				}
			})
			return newState;
			break;



		case COMMAND_RUN:
			var newState = Object.assign({}, state);
			newState.running.push({
				reference: action.reference
			});
			return newState;
			break;

		case INIT:
			return Object.assign(state, action.state);
			break;

		case RUNNING:
			return Object.assign(state, {"running": action.running});
			break;

		case LATEST:
			return Object.assign(state, {"latest": action.latest});
			break;


		case UPDATE:
			return Object.assign(state, action.state);
			break;

		case BUILD_CHANGING:
			var newState = Object.assign(state, {
				components: state.components.map((item, index) => {
					if (item.name === action.name) {
						var newItem = Object.assign({}, item);
						newItem.command = action.command;
						return newItem;
					}
					return item;
				})
			});
			return newState;
			break;

		case PROGRESS:
			var newComponents = state.latest.map((component, index) => {
						component.commands = component.commands.map((command, index) => {
							if (command.name === action.name) {
								var newItem = Object.assign({}, command);
								newItem.progress = action.progress;
								return newItem;
							}
							return command;
						});
						return component;
					});
			var newState = Object.assign(state, {
				latest: newComponents
			});
			return newState;
			break;

		default:
		return state;
	}
}

var rootReducer = combineReducers({app: appReducer})

var store = createStore(rootReducer, {app: INITIAL_STATE});

var data = {

	components: [
		{name: 'terraform/vault', status: 'green', command: 'ready'},
		{name: 'terraform/bastion', status: 'green', command: 'ready'},
		{name: 'terraform/private', status: 'green', command: 'ready'},
		{name: 'terraform/prometheus', status: 'red', command: 'ready'},
		{name: 'packer/ubuntu-java', status: 'green', command: 'ready'},
		{name: 'packer/authenticated-ami', status: 'green', command: 'ready'},
		{name: 'packer/source-ami', status: 'green', command: 'ready'}
	],
	latest: [
		{name: "terraform/vpc",
		commands: [
			{name: 'validate', buildIdentifier: '21', progress: 100},
			{name: 'test', buildIdentifier: '21', progress: 100},
			{name: 'package', buildIdentifier: '21', progress: 60},
			{name: 'plan', buildIdentifier: '21', progress: 0},
			{name: 'run', buildIdentifier: '21', progress: 0},
			{name: 'deploy', buildIdentifier: '21', progress: 0},
			{name: 'release', buildIdentifier: '21', progress: 0},
			{name: 'smoke', buildIdentifier: '21', progress: 0}
		]}
	],
	pipeline: [
		[{name: 'terraform/vault', status: 'green'},
		{name: 'terraform/bastion', status: 'green'},
		{name: 'terraform/private', status: 'green'}],
		[{name: 'terraform/prometheus', status: 'red'},
		{name: 'packer/ubuntu-java', status: 'green'}],
		[{name: 'packer/authenticated-ami', status: 'green'},
		{name: 'packer/source-ami', status: 'green'}]

	]
}

function chunk(arr, chunkSize) {
  var R = [];
  for (var i=0,len=arr.length; i<len; i+=chunkSize)
    R.push(arr.slice(i,i+chunkSize));
  return R;
}

class ComponentList extends React.Component {
	constructor(props) {
		super(props);
		this.triggerBuild = this.triggerBuild.bind(this);
	}

	triggerBuild(item, e) {
		console.log(item);
		fetch('trigger', {
			method: "POST",
			headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
			body: JSON.stringify(item)
		})
	}

	render() {
		var items = this.props.components.map((item, index) => {
			var variant = {green: 'success', 'red': 'danger'}[item.status]
			var attributes = {};
			if (item.command == "running") {
				attributes.animated = true;
			}

			return (
		 <Card className="mb-4" style={{ width: '15rem' }}>
		  <Card.Body>
			<Card.Title>{ item.name }</Card.Title>
			<Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
			<Card.Text>
			  <ProgressBar animated={attributes.animated} variant={variant} now={item.progress} />
			</Card.Text>
			<Card.Link onClick={(e) => { this.props.changer('component', item) }}>View</Card.Link>
			<Card.Link onClick={(e) => { this.triggerBuild(item, e) } }>Trigger</Card.Link>

		  </Card.Body>
		</Card>);
		});

		var chunks = chunk(items, 3);
		var rows = chunks.map((item, index) => {
			return (<Row key={index.toString()}>
			{ item.map((component, index) => {return (<Col key={component.name}>{component}</Col>); })}
			</Row>);
		});

		return (<Container>
		{rows}
		</Container>)
	}
}

class EnvironmentView extends React.Component {
	constructor(props) {
		super(props);
		this.triggerEnvironment = this.triggerEnvironment.bind(this);
	}

	triggerEnvironment(environment, event) {
		console.log("Full trigger of environment", environment);

		fetch('trigger-environment', {
			method: "POST",
			headers: {
						'Content-Type': 'application/json',
						// 'Content-Type': 'application/x-www-form-urlencoded',
				},
			body: JSON.stringify({environment: environment.name})
		})
	}

	render() {
		var environments = this.props.environments.map((environment, index) => {
			var variant = {"broken": "danger", "ready": "success", "building": "success"}[environment["status"]]
			var attributes = {}
			if (environment["status"] == "building") {
				attributes.animated = true;
			}
			return (<Col key={environment.name}>
			 <Card className="mb-4" style={{ width: '15rem' }}>
			  <Card.Body>
				<Card.Title>{ environment.name }</Card.Title>
				<Card.Subtitle className="mb-2 text-muted">{environment.facts}</Card.Subtitle>
				<Card.Text>
				  <ProgressBar variant={variant} animated={attributes.animated} now={environment.progress} />
				</Card.Text>
				<Card.Link onClick={(e) => this.triggerEnvironment(environment, e)}>Run Pipeline</Card.Link>
			  </Card.Body>
			</Card></Col>)
		});
		return (<div><Container><Row>{environments}</Row></Container></div>);
	}
}

class RunningList extends React.Component {
	constructor(props) {

	}
	render() {
		return <div></div>
	}
}

class RunningComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var items = this.props.running.map((item, index) => {
			var variant = {running: 'success', 'ready': 'info'}[item.status]
			var attributes = {};
			attributes.animated = true;

			return (
		 <Card className="mb-4" style={{ width: '15rem' }}>
		  <Card.Body>
			<Card.Title>{ item.reference }</Card.Title>
			<Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
			<Card.Text>
			  <ProgressBar animated={attributes.animated} variant={variant} now={item.progress} />
			</Card.Text>
			<Card.Link href="#">View</Card.Link>
			<Card.Link href="#">Another Link</Card.Link>
		  </Card.Body>
		</Card>);
		});

		var chunks = chunk(items, 4);
		var rows = chunks.map((item, index) => {
			return (<Row key={index.toString()}>
			{ item.map((component, index) => {return (<Col key={component.name}>{component}</Col>); })}
			</Row>);
		});

		return (<Container>
		{rows}
		</Container>)
	}
}


class LatestComponentStatus extends React.Component {
	constructor(props) {
		super(props);
		this.triggerCommand = this.triggerCommand.bind(this);
	}
	triggerCommand(component, command) {
		console.log(component, command);
		fetch('trigger', {
			method: "POST",
			headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
			body: JSON.stringify({name: component["name"] + "/" + command["name"]})
		})
	}
	render() {

			var items = this.props.latest.map((component, index) => {

			var cards = component.commands.map((item, index) => {
			return (<Col key={item.name}>
				 <Card key={item.name} className="mb-4" style={{ width: '10rem' }}>
					<Card.Body>
					<Card.Title>{ item.name }</Card.Title>
					<Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
					<Card.Text>
					{item.buildIdentifier}
					<ProgressBar striped variant="success" now={item.progress} />

					</Card.Text>
					<Card.Link onClick={(e) => this.triggerCommand(component, item, e)}>Trigger</Card.Link>
					<Card.Link href="#">View</Card.Link>
					</Card.Body>
				</Card></Col>);
			});
			return (<div><h2>{component.name}</h2><Row>{cards}</Row></div>);
		});


		return (<div><Container><Row>
		{items}
		</Row></Container></div>)
	}
}

class EnvironmentPipeline extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		var items = (this.props.pipeline.map((group, index) => {

			return group.map((item, index) => {
				var variant = {green: 'success', 'red': 'danger'}[item.status]
				return  <Card key={item.name} className="mb-0 px-0 py-0 mx-0 my-0" style={{ width: '12rem' }}>
			  <Card.Body>
				<Card.Title></Card.Title>
				<Card.Subtitle className="mb-2 text-muted">{ item.name }</Card.Subtitle>
				<Card.Text>
				  <ProgressBar variant={variant} now={item.progress} />
				</Card.Text>
				<Card.Link href="#">View</Card.Link>
			  </Card.Body>
			</Card>
				});
		}));

		var rows = items.map((item, index) => {
			var columns = item.map((cell, index) => { return (<Col key={cell.name} className="col-sm">{cell}</Col>)});
			return (<Row key={index}>{columns}</Row>)
		});
		return (<Container className="d-flex flex-row">
		{rows}
		</Container>)
	}
}

class Screens extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return ( <div className="App">
 	   <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
 		  <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">devops-pipeline</a>
 		  <input className="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search" />
 		  <ul className="navbar-nav px-3">
 			<li className="nav-item text-nowrap">
 			  <a className="nav-link" href="#">Sign out</a>
 			</li>
 		  </ul>
 		</nav>

 		<div className="container-fluid">
 		  <div className="row">
 			<nav className="col-md-2 d-none d-md-block bg-light sidebar">
 			  <div className="sidebar-sticky pt-3">
 				<ul className="nav flex-column">
 				  <li className="nav-item">
 					<a className="nav-link active" href="#">
 					  <span data-feather="home"></span>
 					  Dashboard <span className="sr-only">(current)</span>
 					</a>
 				  </li>
 				  <li className="nav-item">
 					<a className="nav-link" onClick={(e) => {this.props.changer("components")}}>
 					  <span data-feather="file"></span>
 					  Components
 					</a>
 				  </li>
 				  <li className="nav-item">
 					<a className="nav-link" onClick={(e) => {this.props.changer("environments")}}>
 					  <span data-feather="shopping-cart"></span>
 					  Environments
 					</a>
 				  </li>
 				  <li className="nav-item">
 					<a className="nav-link"  onClick={(e) => {this.props.changer("broken")}}>
 					  <span data-feather="users"></span>
 					  Broken
 					</a>
 				  </li>
 				  <li className="nav-item">
 					<a className="nav-link" onClick={(e) => {this.props.changer("pipeline")}}>
 					  <span data-feather="bar-chart-2"></span>
 					  Pipeline
 					</a>
 				  </li>
 				  <li className="nav-item">
 					<a className="nav-link" onClick={(e) => {this.props.changer("running")}}>
 					  <span data-feather="layers"></span>
 					  Running
 					</a>
 				  </li>
					<li className="nav-item">
					<a className="nav-link" onClick={(e) => {this.props.changer("debug")}}>
						<span data-feather="layers"></span>
						Debug
					</a>
					</li>

 						</ul>
					</div></nav>
 			</div>
		</div>
		{this.props.children}
		</div>
	);
	}
}

class Page extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		console.log(this.props.currentscreen);
		if (this.props.currentscreen === this.props.target) {
			return this.props.children;
		}
		return [];
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {screen: "anotherthing"};
		this.setScreen = this.setScreen.bind(this);

	}

	setScreen(screen) {
		this.setState({
			screen: screen
		});
	}

	render() {
			var screens = (<Screens changer={this.setScreen}>
				<main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
				  <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
					<h1 className="h2">Dashboard</h1>



					<div className="btn-toolbar mb-2 mb-md-0">
					  <div className="btn-group mr-2">
						<button className="btn btn-sm btn-outline-secondary">Share</button>
						<button className="btn btn-sm btn-outline-secondary">Export</button>
					  </div>
					  <button className="btn btn-sm btn-outline-secondary dropdown-toggle">
						<span data-feather="calendar"></span>
						This week
					  </button>
					</div>

				  </div>
					<Page currentscreen={this.state.screen} target="debug">
				  <pre>{JSON.stringify(this.props.store.getState(), undefined, 4)}</pre>
					</Page>
					<Page currentscreen={this.state.screen} target="environments">
							<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
							<h2 className="h2">Environment</h2>
							</div>

							 <EnvironmentView environments={this.props.store.getState().app.environments} />

				 	</Page>

				<Page currentscreen={this.state.screen} target="components">
					<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
					<h2 className="h2">Components</h2>
					<div className="btn-toolbar mb-2 mb-md-0">
						<Form.Control type="text" placeholder="Component" />
						</div>
					 </div>


				<ComponentList
					components={this.props.store.getState().app.components}
						changer={this.setScreen} />
		 		</Page>

				<Page currentscreen={this.state.screen} target="component">
				<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
					<h2 className="h2">Component View</h2>
				</div>

				<LatestComponentStatus
					latest={this.props.store.getState().app.latest} />
				</Page>

				<Page
					currentscreen={this.state.screen}
					target="pipeline">
				<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
					<h2 className="h2">Pipeline View</h2>
				</div>

				<EnvironmentPipeline
					pipeline={this.props.store.getState().app.pipeline} />
				</Page>

				<Page
					currentscreen={this.state.screen}
					target="task">
				<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
					<h2 className="h2">Task View</h2>
				</div>
				</Page>

				<Page
				currentscreen={this.state.screen}
				target="component-build">
					<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
						<h2 className="h2">Component Build View</h2>
					</div>
				</Page>

				<Page currentscreen={this.state.screen} target="broken">
				 <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
					<h2 className="h2">Broken</h2>
				 </div>
				</Page>

				 <Page currentscreen={this.state.screen} target="running">
							<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
							 <h2 className="h2">Running</h2>
						 	</div>

							<RunningComponent running={this.props.store.getState().app.running}></RunningComponent>
				</Page>
				  <div className="table-responsive">

				  </div>
				</main>
			</Screens>);

		return (<div>
			{screens}
		</div>);

	}
}


store.subscribe(() => {
	ReactDOM.render(<App store={store} />, document.getElementById('root'));
});

store.dispatch({type: 'INIT', state: data});

fetch('http://localhost:5000/json').then((response) => {
	return response.json();
}).then((json) => {
	store.dispatch({type: 'INIT', state: json})
});

setInterval(() => {
	fetch('http://localhost:5000/json').then((response) => {
		return response.json();
	}).then((json) => {
		store.dispatch({type: "UPDATE", state: json})
	});
}, 10000);

setTimeout(() => {
	store.dispatch(buildChanging('terraform/bastion', 'running'));
}, 5000);

let queued = []
queued.push(() => { store.dispatch(buildChanging('terraform/bastion', 'running')) });

["validate", "test", "package", "plan", "run", "deploy", "smoke"].forEach((item) => {
	["10", "20", "30", "40", "50", "60", "70", "80", "90", "100"].forEach((pct) => {
		queued.push(() => { store.dispatch(progress(item, pct)) });
	});
});


function dispatchTest() {
	if (queued.length == 0) { return; }
	var nextItem = queued.shift();
	nextItem();
}
setInterval(dispatchTest, 1000);

/*
var socket = io({transports: ['websocket', 'polling']});
socket.on('event', function(data) {
		console.log(data);
		store.dispatch(data);
});

socket.on('connect', function() {
		socket.emit('join', {data: 'I\'m connected!'});
		console.log("Connected");
});*/
export default App;
