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
import CardGroup from 'react-bootstrap/Card';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { CSSTransition } from 'react-transition-group';
import { TransitionGroup } from 'react-transition-group';
import ProgressBar from 'react-bootstrap/ProgressBar'
import { createStore, combineReducers } from 'redux';
import io from 'socket.io-client';
import AnsiUp from 'ansi_up';
import Interweave from 'interweave';


const INITIAL_STATE = {
	latest: [],
	pipeline: [],
	components: [],
	running: [],
	environments: [],
	filtering: "",
	selection: "",
	console: "",
	environment: "",
    searching: "",
    searchResults: {
        environments: [],
        components: []
    },
    notifications: []
};
const INIT = 'INIT';
const BUILD_CHANGING = 'BUILD_CHANGING';
const PROGRESS = 'PROGRESS';
const COMMAND_RUN = 'COMMAND_RUN';
const COMMAND_FINISH = 'COMMAND_FINISH';
const RUNNING = 'RUNNING';
const LATEST = 'LATEST';
const UPDATE = 'UPDATE';
const FILTER = 'FILTER';
const LOGS = 'LOGS';
const COMPONENT_SELECTION = 'COMPONENT_SELECTION';
const ENVIRONMENT_SELECTION = 'ENVIRONMENT_SELECTION';
const SEARCH_CHANGED = 'SEARCH_CHANGED';

function buildChanging(name, command) {
	return {
		type: BUILD_CHANGING,
		name: name,
		command: command
	};
}

function progress(name, progress) {
	return {
		type: PROGRESS,
		name: name,
		progress: progress
	};
}

function environmentSelection(environment) {
	return {
		type: ENVIRONMENT_SELECTION,
		environment: environment
	}
}

function filter(term) {
	return {
		type: FILTER,
		term: term
	}
}

function componentSelection(component) {
	return {
		type: COMPONENT_SELECTION,
		selection: component
	}
}

function searchChanged(query) {
	return {
		type: SEARCH_CHANGED,
		query: query
	}
}

function filtering(state, list, key) {
	return list.filter((item) => {
		if (item[key].indexOf(state.filtering) != -1) {
			return true;
		}
		return false;
	})
}

function selection(state, list, key) {
	return list.filter((item) => {
		if (item[key].indexOf(state.selection) != -1) {
			return true;
		}
		return false;
	})
}

var globalUpdate = () => {

	fetch('http://localhost:5000/json?q=' + store.getState().app.searching).then((response) => {
		return response.json();
	}).then((json) => {
		store.dispatch({type: "UPDATE", state: json})
	});
}

function environmentView(store, list) {
	return list.filter((item) => {
		if (item.environment === store.getState().app.environment) {
			return true;
		}
		return false;
	})
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

        case SEARCH_CHANGED:
            var newState = Object.assign({}, state);
            Object.assign(newState, {"searching": action.query})
            return newState;
            break;

		case FILTER:
			var newState = Object.assign({}, state);
			Object.assign(newState, {filtering: action.term});
			return newState;
			break;

		case COMPONENT_SELECTION:
			var newState = Object.assign({}, state);
			Object.assign(newState, {selection: action.selection});
			return newState;
			break;

		case ENVIRONMENT_SELECTION:
			var newState = Object.assign({}, state);
			Object.assign(newState, {environment: action.environment, selection: ""});
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

		case LOGS:
			return Object.assign(state, {"console": action.console});
			break

		case UPDATE:
			if (action.state.filtering == "") {
				delete action.state.filtering;
			}

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
  filtering: "",
	components: [
		{name: 'terraform/vault', status: 'green', command: 'ready', environment: "home"},
		{name: 'terraform/bastion', status: 'green', command: 'ready', environment: "home"},
		{name: 'terraform/private', status: 'green', command: 'ready', environment: "home"},
		{name: 'terraform/prometheus', status: 'red', command: 'ready', environment: "home"},
		{name: 'packer/ubuntu-java', status: 'green', command: 'ready', environment: "home"},
		{name: 'packer/authenticated-ami', status: 'green', command: 'ready', environment: "home"},
		{name: 'packer/source-ami', status: 'green', command: 'ready', environment: "home"}
	],
	latest: [
		{name: "terraform/vpc",
			environment: "home",
		commands: [
			{name: 'validate', buildIdentifier: '21', progress: 100, environment: "home"},
			{name: 'test', buildIdentifier: '21', progress: 100, environment: "home"},
			{name: 'package', buildIdentifier: '21', progress: 60, environment: "home"},
			{name: 'plan', buildIdentifier: '21', progress: 0, environment: "home"},
			{name: 'run', buildIdentifier: '21', progress: 0, environment: "home"},
			{name: 'deploy', buildIdentifier: '21', progress: 0, environment: "home"},
			{name: 'release', buildIdentifier: '21', progress: 0, environment: "home"},
			{name: 'smoke', buildIdentifier: '21', progress: 0, environment: "home"}
		]}
	],
	pipeline: [
		[{name: 'terraform/vault', status: 'green', environment: "home"},
		{name: 'terraform/bastion', status: 'green', environment: "home"},
		{name: 'terraform/private', status: 'green', environment: "home"}],
		[{name: 'terraform/prometheus', status: 'red', environment: "home"},
		{name: 'packer/ubuntu-java', status: 'green', environment: "home"}],
		[{name: 'packer/authenticated-ami', status: 'green', environment: "home"},
		{name: 'packer/source-ami', status: 'green', environment: "home"}]

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
		this.goToComponent = this.goToComponent.bind(this);
		this.propagateChange = this.propagateChange.bind(this);
		this.state = {
			"running": []
		}
	}

	goToComponent(component) {
		this.props.changer('pipeline');
		store.dispatch(componentSelection(component.name));
	}

	triggerBuild(item, e, force) {
		this.state.running = this.state.running.concat(item["name"]);
		this.setState(this.state);
        var data = Object.assign({}, item);
        data.force = force;
		fetch('trigger', {
			method: "POST",
			headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
			body: JSON.stringify(data)
		}).then(() => {
            globalUpdate();
			setTimeout(() => {
				this.state.running = this.state.running.filter((runningItem) => { return runningItem !== item["name"] });
				this.setState(this.state);
			}, 10000);

		});
	}

	forceTriggerBuild(item, e) {
		this.state.running = this.state.running.concat(item["name"]);
		this.setState(this.state);
		fetch('force-trigger', {
			method: "POST",
			headers: {
						'Content-Type': 'application/json',
						// 'Content-Type': 'application/x-www-form-urlencoded',
				},
			body: JSON.stringify(item)
		}).then(() => {
			setTimeout(() => {
				this.state.running = this.state.running.filter((runningItem) => { return runningItem !== item["name"] });
				this.setState(this.state);
			}, 10000);

		});
	}

	propagateChange(item, e) {
			console.log(item);
			fetch('propagate', {
				method: "POST",
				headers: {
	            'Content-Type': 'application/json',
	            // 'Content-Type': 'application/x-www-form-urlencoded',
	        },
				body: JSON.stringify(item)
			})
		}

	render() {
		var items = filtering(store.getState().app,
								environmentView(store, this.props.components), 'name')
		.map((item, index) => {
			var variant = "danger";
            if (item.build_success == "success") {
                variant = "success";
            }
			var attributes = {};
			if (item.status == "running") {
				attributes.animated = true;
			}
			var triggerButton = <div></div>

			if (item.status === "running") {
				triggerButton = <img src="static/ajax-loader.gif"></img>
			}
			if (this.state.running.indexOf(item["name"]) != -1) {
				triggerButton = <img src="static/loading.gif"></img>
			}
			else if (item.status === "ready") {
				 triggerButton = <Card.Link onClick={(e) => { this.triggerBuild(item, e, false) } }>Trigger</Card.Link>;
			}

			return (
		 <Card key={item.environment + item.name} className="mb-4" style={{ width: '18rem' }}>
		  <Card.Body>
			<Card.Title>{ item.name }</Card.Title>
			<Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
			<Card.Text>
			  <ProgressBar animated={attributes.animated} variant={variant} now={item.progress} />
			</Card.Text>
			<Card.Link onClick={(e) => { this.goToComponent(item, e) }}>View</Card.Link>
			{triggerButton}
			<Card.Link onClick={(e) => { this.triggerBuild(item, e, true) } }>Force</Card.Link>
			<Card.Link onClick={(e) => { this.propagateChange(item, e) }}>Propagate</Card.Link>

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
		this.switchEnvironment = this.switchEnvironment.bind(this);
        this.validate = this.validate.bind(this);
	}

	switchEnvironment(environment) {
		store.dispatch(environmentSelection(environment.name));
		this.props.screenchanger("components");
	}

    validate(item, e) {
        console.log(item);
		fetch('validate', {
			method: "POST",
			headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
			body: JSON.stringify(item)
		})
    }

	triggerEnvironment(environment, forced, event) {
		console.log("Full trigger of environment", environment);

		fetch('trigger-environment', {
			method: "POST",
			headers: {
						'Content-Type': 'application/json',
						// 'Content-Type': 'application/x-www-form-urlencoded',
				},
			body: JSON.stringify({environment: environment.name, forced: forced})
		}).then(function () {
            globalUpdate();
        })
	}

	render() {
		var environments = this.props.environments.map((environment, index) => {
            var variant = "danger";
            if (environment.build_success == "success") {
                 variant = "success";
            }
			var attributes = {}
			if (environment["status"] == "running") {
				attributes.animated = true;
			}
			return (<Col key={environment.name}>
			 <Card className="mb-4" style={{ width: '17rem' }}>
			  <Card.Body>
				<Card.Title>{ environment.name }</Card.Title>
				<Card.Subtitle className="mb-2 text-muted">{environment.facts}</Card.Subtitle>
				<Card.Text>
				  <ProgressBar variant={variant} animated={attributes.animated} now={environment.progress} />
				</Card.Text>
				<Card.Link onClick={(e) => this.triggerEnvironment(environment, false, e)}>Run</Card.Link>
                <Card.Link onClick={(e) => this.triggerEnvironment(environment, true, e)}>Force Run</Card.Link>
				<Card.Link onClick={(e) => this.switchEnvironment(environment, e)}>Switch to this environment</Card.Link>
                <Card.Link onClick={(e) => { this.validate(environment, e) }}>Propagate</Card.Link>
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
		this.viewLog = this.viewLog.bind(this);
		this.state = {};
	}
	triggerCommand(component, command, force) {
        var trigger = component["name"];
        if (command != null) {
            trigger = component["name"] + "/" + command["name"]
        }

		console.log(component, command, force);
		fetch('trigger', {
			method: "POST",
			headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
			body: JSON.stringify({name: trigger, force: force, environment: component["environment"]})
		}).then((response) => {
            globalUpdate();
        });
	}

	viewLog(component, command, event) {



			fetch('http://localhost:5000/logs', {
				method: "POST",
				headers: {
							'Content-Type': 'application/json'
					},
				body: JSON.stringify({environment: component.environment, component: component, command: command})
			}).then((response) => {
				return response.json();
			}).then((json) => {
				store.dispatch({type: 'LOGS', console: json.console})
			});

			this.props.selector(
					[component["name"], command["name"], "console"].join("/")
				);
			this.props.changer("command");
	}

	render() {

			var items = selection(store.getState().app, environmentView(store, this.props.latest), 'name').map((component, index) => {




			var cards = component.commands.map((item, index) => {
                if (item.build_success == "success") {
                    var variant = "success";
                } else {
                    var variant = "danger";
                }

                if (item.status == "running") {
                    var progressBar = <ProgressBar striped animated variant={variant} now={item.progress} />;
                } else {
                    var progressBar =  <ProgressBar striped variant={variant} now={item.progress} />;
                }
			return (<Col key={item.environment + item.name}>
				 <Card key={item.environment + item.name} className="mb-4" style={{ width: '10rem' }}>
					<Card.Body>
					<Card.Title>{ item.name }</Card.Title>
					<Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
					<Card.Text>
					{item.build_number}
                    {progressBar}
					</Card.Text>
					<Card.Link onClick={(e) => this.triggerCommand(component, item, true)}>Trigger</Card.Link>
					<Card.Link onClick={(e) => this.viewLog(component, item, e)}>View</Card.Link>
					</Card.Body>
				</Card></Col>);
			});
			return (<div><h2>{component.environment}/{component.name}</h2>
                <Row>
                    <a href="#" onClick={(e) => {this.triggerCommand(component, null, false)}}>Trigger all</a>
                    <a href="#" onClick={(e) => {this.triggerCommand(component, null, true)}}>Force trigger all</a>
                </Row>
                <Row>{cards}</Row>
                </div>);
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
				var variant = {green: 'success', 'red': 'danger'}[item.status];
                var animated = "";
                if (item.status == "running") {
                    animated = "animated";
                };
				return  <Card key={item.name} className="mb-0 px-0 py-0 mx-0 my-0" style={{ width: '12rem' }}>
			  <Card.Body>
				<Card.Title></Card.Title>
				<Card.Subtitle className="mb-2 text-muted">{ item.name }</Card.Subtitle>
				<Card.Text>
				  <ProgressBar animated={animated} variant={variant} now={item.progress} />
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
		this.changeScreen = this.changeScreen.bind(this);
        this.searchChanged = this.searchChanged.bind(this);
	}

	changeScreen(newScreen, component) {
		this.props.changer(newScreen);
    }

    searchChanged(event) {
        this.props.onSearchChanged(event.target.value);
    }

	render() {
		var searchBox = <input className="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search" onChange={(e) => {this.searchChanged(e)}} />

		return ( <div className="App">
 	   <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
 		  <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">Mazzle</a>
 		  {searchBox}

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
 					<a className="nav-link" onClick={(e) => {this.changeScreen("components")}}>
 					  <span data-feather="file"></span>
 					  Components
 					</a>
 				  </li>
 				  <li className="nav-item">
 					<a className="nav-link" onClick={(e) => {this.changeScreen("environments")}}>
 					  <span data-feather="shopping-cart"></span>
 					  Environments
 					</a>
 				  </li>
 				  <li className="nav-item">
 					<a className="nav-link"  onClick={(e) => {this.changeScreen("broken")}}>
 					  <span data-feather="users"></span>
 					  Broken
 					</a>
 				  </li>
 				  <li className="nav-item">
 					<a className="nav-link" onClick={(e) => {this.changeScreen("pipeline", null)}}>
 					  <span data-feather="bar-chart-2"></span>
 					  Pipeline
 					</a>
 				  </li>
 				  <li className="nav-item">
 					<a className="nav-link" onClick={(e) => {this.changeScreen("running")}}>
 					  <span data-feather="layers"></span>
 					  Running ({this.props.running.length})
 					</a>
 				  </li>

                  <li className="nav-item">
                  <a className="nav-link" onClick={(e) => {this.changeScreen("parallelism")}}>
                      <span data-feather="layers"></span>
                      Parallelism
                  </a>
                  </li>
					<li className="nav-item">
					<a className="nav-link" onClick={(e) => {this.changeScreen("debug")}}>
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
		if (this.props.currentscreen === this.props.target) {
			return this.props.children;
		}
		return [];
	}
}

class Restriction extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		if (this.props.selection.indexOf(this.props.target) != -1) {
			return this.props.children;
		}
		return [];
	}
}

class Console extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		var ansi_up = new AnsiUp;

		var html = ansi_up.ansi_to_html(this.props.console);
		// var pre = <pre id="console"> dangerouslySetInnerHTML={{__html: html}}></pre>;
	  var pre = <pre id="console"><Interweave content={html} /></pre>;
		return (<Navbar fixed="bottom" bg="dark" variant="dark">
			{pre}</Navbar>);
	}
}

class Position extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var things = {
			0: {name: "Provider", screen: "components", handler: (item) => {

					store.dispatch(filter(item));
			}},
			1: {name: "Component", screen: "pipeline", handler: (item, reference) => { console.log(reference); this.props.selector(reference); } },
			2: {name: "Command", screen: "command"},
			3: {name: "Screen", screen: "command"}
		};
		var splitted = this.props.selection.split("/");
		var places = splitted.map((place, index) => {
			var reference = splitted.slice(0, index + 1).join("/");
			return (<div><Breadcrumb.Item key={place} onClick={(e) => {

				this.props.screenchanger(things[index].screen);
				if (things[index].hasOwnProperty("handler")) {
					things[index].handler(place, reference);
				}
			}}>/ {place} </Breadcrumb.Item></div>)
		});
		return (<div> <Breadcrumb>
			<Breadcrumb.Item onClick={(e) => {
				this.props.screenchanger("environments");
				store.dispatch(filter(""));
			}}> {this.props.environment} </Breadcrumb.Item>
		  {places}
		</Breadcrumb></div>);
	}
}

class Notifications extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var cards = this.props.data.map((item, index) => {
            return <CSSTransition key={item.id} classNames="example" timeout={{ enter: 500, exit: 300 }}><Card
    bg={item.variant.toLowerCase()}
    key={item.id}
    text={item.variant.toLowerCase() === 'light' ? 'dark' : 'white'}
    style={{ "min-width": '18em', "min-height": '10em' }}
    className=""
  >
    <Card.Header>{item.header}</Card.Header>
    <Card.Body>
      <Card.Title>{item.title}</Card.Title>
      <Card.Text>
        {item.text}
      </Card.Text>
    </Card.Body>
  </Card></CSSTransition>
    });
    return <div className="notifications">

    <TransitionGroup>{cards}</TransitionGroup></div>;
    }

}

class SearchResults extends React.Component {
    constructor(props) {
        super(props);
    }



    render() {
        var self = this;
        var environments = this.props.searchResults.environments.map(item => {
            return <li><a href="#" onClick={(e) => {self.props.changer["environment"](item)}}>{item}</a></li>
        });
        var components = environmentView(store, this.props.searchResults.components).map(item => {
            return <li><a href="#" onClick={(e) => {self.props.changer["component"](item.name)}}>{item.name}</a></li>
        });

        return (<div className="searchResults">
        <div class="components resultBlock">
                <div className="searchHeading">COMPONENTs:</div>
                <ul>
                {components}
                </ul>
        </div>
        <div class="environments resultBlock">
                <div className="searchHeading">ENVIRONMENTs:</div>
                <ul>
                {environments}
                </ul>
        </div>
        </div>)
    }
}

class ParallelismComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var keys = Object.keys(this.props.parallelism);
        var chunks = keys.map(item => {
            var listItems = this.props.parallelism[item].map(component => {
                return <li>{component}</li>;
            });
            return (<div>
            <h2>Stage {item}</h2>
            <ul>
                {listItems}
            </ul>
            </div>);
        });
        return <div>{chunks}</div>;
    }
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {screen: "environments"};
		this.setScreen = this.setScreen.bind(this);
		this.selector = this.selector.bind(this);
		this.componentFilterChange = this.componentFilterChange.bind(this);
        this.onSearchChanged = this.onSearchChanged.bind(this);
        var self = this;
        this.changers = {
                "environment": function (environment) {
                    store.dispatch(environmentSelection(environment));
            		self.setScreen("components");
                },
                "component": function (component) {
                    store.dispatch(filter(component));
                    self.setScreen("components");
                }
        }
	}

	componentFilterChange(event) {
		store.dispatch(filter(event.target.value));
	}

	setScreen(screen, component) {
		this.setState({
			screen: screen
		});
		if (component) {
			store.dispatch(componentSelection(component.name));
		}
	}

	selector(selection) {
		console.log(selection);
		store.dispatch(componentSelection(selection));
	}

    onSearchChanged(newSearch) {
        store.dispatch(searchChanged(newSearch));
        globalUpdate();
    }

	render() {


			var screens = (<Screens running={store.getState().app.running} onSearchChanged={this.onSearchChanged} changer={this.setScreen}>
				<main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
                  <SearchResults changer={this.changers} searchResults={store.getState().app.searchResults}></SearchResults>
                  <Notifications data={store.getState().app.notifications}></Notifications>
				  <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">

					<Position environment={store.getState().app.environment} screenchanger={this.setScreen} selector={this.selector} selection={store.getState().app.selection}></Position>
					<h1 className="h2">Dashboard</h1>



					<div className="btn-toolbar mb-2 mb-md-0">

					</div>

				  </div>
					<Page currentscreen={this.state.screen} target="debug">
				  <pre>{JSON.stringify(this.props.store.getState(), undefined, 4)}</pre>
					</Page>
					<Page currentscreen={this.state.screen} target="environments">
							<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
							<h2 className="h2">Environment</h2>
							</div>

							 <EnvironmentView environments={this.props.store.getState().app.environments} screenchanger={this.setScreen} />

				 	</Page>

				<Page currentscreen={this.state.screen} target="components">
					<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
					<h2 className="h2">Components</h2>
					<div className="btn-toolbar mb-2 mb-md-0">
						<Form.Control type="text" placeholder="Component" value={store.getState().app.filtering} onChange={this.componentFilterChange} />
						</div>
					 </div>


				<ComponentList
					components={this.props.store.getState().app.components}
						changer={this.setScreen} />
		 		</Page>

				<Page currentscreen={this.state.screen} target="pipeline">
				<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
					<h2 className="h2">Pipeline View</h2>
				</div>

				<LatestComponentStatus
					latest={this.props.store.getState().app.latest}
					selector={this.selector}
					changer={this.setScreen} />
				</Page>

				<Page
					currentscreen={this.state.screen}
					target="task">
				<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
					<h2 className="h2">Pipeline</h2>
				</div>

				<EnvironmentPipeline
					pipeline={this.props.store.getState().app.pipeline} />
				</Page>

				<Page
					currentscreen={this.state.screen}
					target="command">
				<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
					<h2 className="h2">Command View</h2>
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

                <Page currentscreen={this.state.screen} target="parallelism">
                           <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h2 className="h2">Parallelism</h2>
                           </div>

                           <ParallelismComponent parallelism={this.props.store.getState().app.parallelism}></ParallelismComponent>
               </Page>

				  <div className="table-responsive">

				  </div>
				</main>

				<Restriction selection={store.getState().app.selection} target="console">
					<Console console={this.props.store.getState().app.console} ></Console>
				</Restriction>

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



setInterval(globalUpdate, 5000);

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
// setInterval(dispatchTest, 1000);

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
