// There is only one environment and it keeps a collection of all systems.
// A system is defined as the "system agent".
// For every system the environment keeps a LATT.
// To combine different systems with each other and make them work together,
// the environment will find a way to deploy the leaf nodes of multiple LATTs together.

var Environment = function(graph) {
	// Hashtable of systems
	this.systems = new Object();
	// Contains the updates to the environment
	this.history_html = "";

	// Graph to draw 
	// TODO: This should be moved somewhere else.
	this.graph = typeof graph !== 'undefined' ? graph : new jsnx.DiGraph();
}

Environment.prototype.removeSystem = function(system) {
	// Remove the given system from the environment
	if (!this.systems.hasOwnProperty(system.name))
		return false;
	delete this.systems[system.name];
	return true;
}

Environment.prototype.removeSystemByName = function(systemname) {
	// Remove the given system from the environment
	if (!this.systems.hasOwnProperty(systemname))
		return false;
	delete this.systems[systemname];
	return true;
}

Environment.prototype.addSystem = function(system) {
	// Add the given system to the environment, by name
	if (this.systems.hasOwnProperty(system.name))
		return false;
	this.systems[system.name] = system;
	return true;
}

Environment.prototype.drawLATT = function(systemname) {
	if (!this.systems.hasOwnProperty(systemname))
		return false;
	this.graph = this.systems[systemname].graph;
	return true;
}

Environment.prototype.drawDeployment = function(systemname) {
	if (!this.systems.hasOwnProperty(systemname))
		return false;
	this.graph = this.systems[systemname].deployment.graph;
	return true;
}

Environment.prototype.getSystemByName = function(systemname) {
	// Returns the system if it exists
	if (!this.systems.hasOwnProperty(systemname))
		return false;
	return this.systems[systemname];
}

Environment.prototype.updateSystem = function(systemname, newsystem) {
	// Updates the system with the given newsystem
	if (!this.systems.hasOwnProperty(systemname))
		return false;
	this.systems[systemname] = newsystem;
	return true;
}

Environment.prototype.getSystems = function() {
	// Return the list of systems
	var rstr = "";
	for (var system in this.systems) {
	    // use hasOwnProperty to filter out keys from the Object.prototype
	    if (this.systems.hasOwnProperty(system)) {
	        rstr += this.systems[system].toString() + '\n';
	    }
	}
	return rstr;
};

Environment.prototype.toString = function() {	
	return this.getSystems();
};

Environment.prototype.getLeaves = function(systemname) {
	// Find the system!
	var system = this.getSystemByName(systemname);
	if (!system)
		return false;
	return system.getLeaves();
};

// DEPLOYMENT
Environment.prototype.connect = function(name1, name2) {
	var system1 = this.getSystemByName(name1);
	var system2 = this.getSystemByName(name2);
	if (!system1 || !system2)
		return false;
	
	console.log("System 2: " + system2.deployment.preconnect);
	this.graph = new jsnx.DiGraph();
	// If system1 has a postconnect, edit system2
	if (system1.deployment.postconnect) system1.deployment.postconnect(system2);
	var system2deployment = system2.deployment;
	// If system2 has a preconnect, edit system1
	if (system2.deployment.preconnect) system2.deployment.preconnect(system1);
	var system1deployment = system1.deployment;
	
	for (var i = 0; i < system1deployment.graph.nodes().length; i++) {
		this.graph.addNode(system1deployment.graph.nodes()[i]);
	}
	for (i = 0; i < system2deployment.graph.nodes().length; i++) {
		this.graph.addNode(system2deployment.graph.nodes()[i]);
	}
	for (i = 0; i < system1deployment.graph.edges().length; i++) {
		this.graph.addEdge(system1deployment.graph.edges()[i][0], system1deployment.graph.edges()[i][1]);
	}
	for (i = 0; i < system2deployment.graph.edges().length; i++) {
		this.graph.addEdge(system2deployment.graph.edges()[i][0], system2deployment.graph.edges()[i][1]);
	}
	for (i = 0; i < system1deployment.outputNodes.length; i++) {
		for (var j = 0; j < system2deployment.inputNodes.length; j++) {
			this.graph.addEdge(system1deployment.outputNodes[i], system2deployment.inputNodes[j]);
		}
	}
	return true;
}

// TRANSFORMATIONS
Environment.prototype.shard = function(systemname, n) {
	// Find the system!
	var system = this.getSystemByName(systemname);
	if (!system)
		return false;
	console.log("Sharding system!");
	system.deployment = new Deployment();
	// Transform!
	// Add client proxy
	var clientproxy = new Agent(system.name+"/cproxy", "omnids.shard.clientproxy");
	system.graph.addNode(clientproxy);
	system.graph.addEdge(system.systemagent, clientproxy);
	system.deployment.preconnect = function(givensystem) {
		// The LATT of the system does not change, just the deployment
		givensystem.deployment.graph.addNode(clientproxy);
		for (var k = 0; k < givensystem.deployment.outputNodes.length; k++)
			givensystem.deployment.graph.addEdge(givensystem.deployment.outputNodes[k], clientproxy);
		givensystem.deployment.outputNodes = [clientproxy];
	}
	
	// Add replicas and main agents
	for (var j = 0; j < n; j++) {
		var serverproxy = new Agent(system.name+"/sproxy"+j.toString(), "omnids.shard.serverproxy");
		system.graph.addNode(serverproxy);
		system.graph.addEdge(system.systemagent, serverproxy);
		system.deployment.graph.addNode(serverproxy);
		system.deployment.inputNodes.push(serverproxy);
		var shard = new Agent(system.name+"/shard"+j.toString(), system.systemagent.module);
		system.graph.addNode(shard);
		system.graph.addEdge(system.systemagent, shard);
		system.deployment.graph.addNode(shard);
		system.deployment.graph.addEdge(serverproxy, shard);
		system.deployment.outputNodes.push(shard);
	}
	console.log("Sharded system: " + system.toString());
	this.updateSystem(systemname, system);
	return true;
}

Environment.prototype.encrypt = function(systemname) {
	// Find the system!
	var system = this.getSystemByName(systemname);
	if (!system)
		return false;
	console.log("Encrypting system!");
	// Transform!
	// Add encrypter & decrypter
	var preEncrypter = new Agent(system.name+"/pre_encrypter", "omnids.encrypter");
	var postEncrypter = new Agent(system.name+"/post_encrypter", "omnids.encrypter");
	var preDecrypter = new Agent(system.name+"/pre_decrypter", "omnids.decrypter");
	var postDecrypter = new Agent(system.name+"/post_decrypter", "omnids.decrypter");
	var main = new Agent(system.name+"/main", system.systemagent.module);
	console.log("Created agents!");
	// Add new agents
	system.graph.addNode(preEncrypter);
	system.graph.addNode(postEncrypter);
	system.graph.addNode(preDecrypter);
	system.graph.addNode(postDecrypter);
	system.graph.addNode(main);
	console.log("Added nodes!");
	
	// Add new level of the LATT with edges
	system.graph.addEdge(system.systemagent, preEncrypter);
	system.graph.addEdge(system.systemagent, postEncrypter);
	system.graph.addEdge(system.systemagent, preDecrypter);
	system.graph.addEdge(system.systemagent, postDecrypter);
	system.graph.addEdge(system.systemagent, main);
	console.log("Added edges!");
	
	this.updateSystem(systemname, system);
	return true;
}

Environment.prototype.paxos = function(systemname, n) {
	// Find the system!
	var system = this.getSystemByName(systemname);
	if (!system)
		return false;
	console.log("Replicating system with Paxos!");
	// Transform!
	// Add proxy
	var proxy = new Agent(system.name+"/serverproxy", "omnids.paxos.proxy");
	system.graph.addNode(proxy);
	system.graph.addEdge(system.systemagent, proxy);
	// Add replicas and main agents
	for (var j = 0; j < n; j++) {
		var replica = new Agent(system.name+"/replica"+j.toString(), "omnids.paxos.replica");
		system.graph.addNode(replica);
		system.graph.addEdge(system.systemagent, replica);
		var main = new Agent(system.name+"/main"+j.toString(), system.systemagent.module);
		system.graph.addNode(main);
		system.graph.addEdge(system.systemagent, main);
	}
	this.updateSystem(systemname, system);
	return true;
}
