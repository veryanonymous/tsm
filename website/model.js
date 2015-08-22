var box = "127.0.0.1:12000";

var state_html = "";
var environment = new Environment();

var createSystemfromCASM = function(casm) {
	var system = new System(casm.name);
	system.graph.addNode(casm, {'name': casm.name});
	system.inputNodes.push(casm);
	system.outputNodes.push(casm);
	return system;
}

var createElement = function(name, module, box) {
	var system = createSystemfromCASM(new CASM(name, module, box));
	// Add the system to the environment
	environment.graph.addNode(system, {'name': system.name});
	console.log("Added Node to the Environment:\n" + environment.toString());
	environment.history_html += "Added " + name + "<br>";
}

var removeElement = function(name) {
	var i;
	// Find the system
	for (i = 0; i < environment.graph.nodes().length; i++) {
		if (environment.graph.nodes()[i].name == name) {
			environment.graph.removeNode(environment.graph.nodes()[i]);
			return;
		}
	}
}

var connectSystems = function(name1, name2) {
	return this.environment.connect(name1, name2);
}

var disconnectSystems = function(name1, name2) {
	var i, system1, system2;
	// Find the systems
	for (i = 0; i < environment.graph.nodes().length; i++) {
		if (name1 == environment.graph.nodes()[i].name)
			system1 = environment.graph.nodes()[i];
		if (name2 == environment.graph.nodes()[i].name)
			system2 = environment.graph.nodes()[i];
	}
	
	if (system1 && system2) {	
		if (environment.graph.hasEdge(system1, system2)) {
			environment.graph.removeEdge(system1, system2);
			return 1;
		}
	}
	return 0;
}

var paxosSystem = function(name, n) {
	return environment.paxos(name,n);
}
// DONE UNTIL HERE

var quorumCASM = function(name, n) {
	// TODO: The Element to transform has to be a single CASM?
	if (name in systems) {
		var oldSystem = systems[name];
		var newSystem = quorum(systems[name].graph.nodes()[0], n);
		mainSystem.replace(oldSystem, newSystem);
		return 1;
	}
	return 0;
}

var restart = function() {
	// Restarts the system, deletes all nodes and edges.
	mainSystem = new System("main");
}

var examplegraph = function() {
  var client =  new CASM("client", "omnids.client", box);
  var server =  new CASM("server", "omnids.server", box);
  
  mainSystem = quorum(client, 3);
  var serverSystem = paxos(server, 3);
  mainSystem.postconnect(serverSystem);
}

var stateToString = function() {
	var rstr = "High-level State:\n Systems:\n";
	for (name in systems){
		if (name != "main") rstr += '- ' + name + '\n';
	}
	rstr += "\n\nLow-level State:\n";
	rstr += mainSystem.toString();
	
	return rstr;
}


