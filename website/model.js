var box = "127.0.0.1:12000";

var state_html = "";
var mainSystem = new System("main"); // low-level graph
var systems = { "main" : mainSystem };
	
function isNumber(obj) { return !isNaN(parseFloat(obj)) }

var paxos = function(casm, n) {
	var proxy,node,replica,system,replicas;
	var i,j;
	replicas = [];
	system = new System(casm.name);
	// TODO: Add proxy per client!
	proxy = new CASM(casm.name+"/proxy", "omnids.paxos.proxy", box);
	system.structure.inputNodes.push(proxy);
	for (i = 0; i < n; i++) {
		replica = new CASM(casm.name+"/replica"+i.toString(), "omnids.paxos.replica", box);
		node = new CASM(casm.name+"/"+casm.name+i.toString(), casm.module, casm.box);
		replicas.push(replica);
		system.structure.graph.addNodesFrom([replica, node]);
		system.structure.graph.addEdge(proxy, replica);
		system.structure.graph.addEdge(replica, node);
		system.structure.outputNodes.push(node);
	}

	// Add edges between replicas
	for (i = 0; i < n; i++){
		for (j = i+1; j < n; j++) {
			console.log(replicas[i]);
			console.log(replicas[j]);
			system.structure.graph.addEdge(replicas[i], replicas[j]);
		}
	}
	systems[casm.name] = system;
	return system;
}

var quorum = function(casm, n) {
	var node,proxy,quorum,system;
	system =  new System(casm.name);
	for (i = 0; i < n; i++) {
		quorum = new CASM(casm.name+"/quorum"+i.toString(), "omnids.quorum.quorum", box);
		node = new CASM(casm.name+"/"+casm.name+i.toString(), casm.module, casm.box);
		proxy = new CASM(casm.name+"/proxy"+i.toString(), "omnids.quorum.proxy", box);
        
		system.structure.graph.addNodesFrom([quorum, node, proxy]);
		system.structure.graph.addEdge(node, quorum);
		system.structure.graph.addEdge(quorum, proxy);
		system.structure.inputNodes.push(node);
		system.structure.outputNodes.push(proxy);
	 }
	systems[casm.name] = system;
	return system;
}

var createSystemfromCASM = function(casm) {
	var system = new System(casm.name, new Structure());
	system.structure.graph.addNode(casm);
	system.structure.inputNodes.push(casm);
	system.structure.outputNodes.push(casm);
	systems[casm.name] = system;
	return system	
}

var createCASM = function(name, module, box) {
	var casm = new CASM(name, module, box)
	var casmSystem = createSystemfromCASM(casm);
	state_html += "Added " + casm.name + "<br>";
	
	// Update the main system and the system state
	mainSystem.structure.graph.addNode(casm);
}

var removeElement = function(name) {
	// TODO: Maybe replace with nothing! 
	var i, index, node;
	console.log(systems);
	if (name in systems){
		// Remove every element in the system
		console.log(systems[name].structure.graph.nodes());
		for (i = 0; i < systems[name].structure.graph.nodes().length; i++) {
			node = systems[name].structure.graph.nodes()[i];
			// Remove from inputNodes
			index = mainSystem.structure.inputNodes.indexOf(node);
			if (index > -1) mainSystem.structure.inputNodes.splice(index, 1);
			// TODO: Adjust?!
			// Remove from outputNodes
			index = mainSystem.structure.outputNodes.indexOf(node);
			if (index > -1) mainSystem.structure.outputNodes.splice(index, 1);
			// TODO: Adjust?!
			mainSystem.structure.graph.removeNode(node);
		}
	}
}

var connectElements = function(name1, name2) {
	if (name1 in systems && name2 in systems) {
		// TODO: What if name1 and name2 have multiple elements?!
		mainSystem.structure.graph.addEdge(systems[name1].structure.graph.nodes()[0],
										   systems[name2].structure.graph.nodes()[0]);
		return 1;
	}
	return 0;
}

var disconnectElements = function(name1, name2) {
	if (name1 in systems && name2 in systems) {
		// TODO: What if name1 and name2 have multiple elements?!
		mainSystem.structure.graph.removeEdge(systems[name1].structure.graph.nodes()[0],
											  systems[name2].structure.graph.nodes()[0]);
		return 1;
	}
	return 0;
}
var paxosCASM = function(name, n) {
	// TODO: The Element to transform has to be a single CASM?
	if (name in systems) {
		var oldSystem = systems[name];
		var newSystem = paxos(systems[name].structure.graph.nodes()[0], n);
		mainSystem.structure.replace(oldSystem, newSystem);
		return 1;
	}
	return 0;
}

var quorumCASM = function(name, n) {
	// TODO: The Element to transform has to be a single CASM?
	if (name in systems) {
		var oldSystem = systems[name];
		var newSystem = quorum(systems[name].structure.graph.nodes()[0], n);
		mainSystem.structure.replace(oldSystem, newSystem);
		return 1;
	}
	return 0;
}

var restart = function() {
	// Restarts the structure, deletes all nodes and edges.
	mainSystem.structure = new Structure();
}

var examplegraph = function() {
  var client =  new CASM("client", "omnids.client", box);
  var server =  new CASM("server", "omnids.server", box);
  
  mainSystem.structure = new Structure([client], [client]);
  mainSystem.structure.graph.addNode(client);
  var serverStructure = new Structure([server], [server]);
  serverStructure.graph.addNode(server);
  serverStructure = paxos(server, 3);
  mainSystem.structure = quorum(client, 3);
  mainSystem.structure.connect(serverStructure);
}

var stateToString = function() {
	var rstr = "High-level State:\n Systems:\n";
	for (name in systems){
		if (name != "main") rstr += '- ' + name + '\n';
	}
	rstr += "\n\nLow-level State:\n";
	rstr += mainSystem.structure.toString();
	
	return rstr;
}


