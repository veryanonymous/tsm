var Deployment = function(graph, inputNodes, outputNodes) {
	this.graph = typeof graph !== 'undefined' ? graph : new jsnx.DiGraph();
	this.inputNodes = typeof inputNodes !== 'undefined' ? inputNodes : [];
	this.outputNodes = typeof outputNodes !== 'undefined' ? outputNodes : [];
	
	this.preconnect = null;
	this.postconnect = null;
}

Deployment.prototype.preconnect = function(system) {
	
};

Deployment.prototype.postconnect = function(system) {
//	// Connects the givenSystem to the outputNodes of the system
//    // Add new nodes
//	this.graph.addNodesFrom(givenSystem.graph.nodes());
//	// Add new edges
//    this.graph.addEdgesFrom(givenSystem.graph.edges());
//    // Connect systems
//    for (i = 0; i < this.outputNodes.length; i++) { 
//    	for (j = 0; j < givenSystem.inputNodes.length; j++) {
//    		// Create new edges
//    		this.graph.addEdge(this.outputNodes[i], givenSystem.inputNodes[j]);
//    	}	    
//    }
//    // Adjust outputNodes
//	this.outputNodes = [];
//	for (i = 0; i < givenSystem.outputNodes.length; i++) {
//		this.outputNodes.push(givenSystem.outputNodes[i]);
//	}
};

Deployment.prototype.state = function() {
	var rstr = 'Deployment\n';
	for (i = 0; i < this.graph.edges().length; i++) {
		rstr += '(' + this.graph.edges()[i][0].name + ',' + this.graph.edges()[i][1].name + ');';
	}
	return rstr.substring(0, rstr.length-1);
}

Deployment.prototype.serialize = function() {
	// This is the low-level representation, includes system nodes and edges
	// TODO: include modules.
	var nodes = '';
	for (var i = 0; i < this.graph.nodes().length; i++) {
		nodes += this.graph.nodes()[i].serialize();
	}
	var edges = '';
	// Add edge pairs separated with semicolons: (a,b);(b,a)
	for (i = 0; i < this.graph.edges().length; i++)
		edges += "("+this.graph.edges()[i]+");"
	edges = edges.slice(0,-1);
	// Add input and output nodes
	var inodes = this.inputNodes.toString();
	var onodes = this.outputNodes.toString();
	
	console.log("NODES: " + nodes);
	console.log("EDGES: " + edges);
	var rjson = {"nodes":nodes,"edges":edges,"inputNodes":inodes,"outputNodes":onodes};
	return JSON.stringify(rjson);
}

Deployment.prototype.toString = function() {
	var rstr = 'Deployment\n';
	for (var i = 0; i < this.graph.nodes().length; i++) {
		rstr += this.graph.nodes()[i].name + '\n';
	}
	for (i = 0; i < this.graph.edges().length; i++) {
		rstr += '(' + this.graph.edges()[i][0].name + ',' + this.graph.edges()[i][1].name + '); ';
	}
	return rstr.substring(0, rstr.length-1);
};

/////////////////////////////////////////////
//
//var connectSystems = function(name1, name2) {
//	return this.environment.connect(name1, name2);
//}
//
//var disconnectSystems = function(name1, name2) {
//	var i, system1, system2;
//	// Find the systems
//	for (i = 0; i < environment.graph.nodes().length; i++) {
//		if (name1 == environment.graph.nodes()[i].name)
//			system1 = environment.graph.nodes()[i];
//		if (name2 == environment.graph.nodes()[i].name)
//			system2 = environment.graph.nodes()[i];
//	}
//
//	if (system1 && system2) {
//		if (environment.graph.hasEdge(system1, system2)) {
//			environment.graph.removeEdge(system1, system2);
//			return 1;
//		}
//	}
//	return 0;
//}


//////////////////////////////////////////////
//connect: function(name1, name2) {
//	if (connectSystems(name1, name2)) {
//		updateState();
//	}
//	else
//		this.echo("System does not exist!");
//},
//disconnect: function(name1, name2) {
//	if (disconnectSystems(name1, name2)) {
//		updateState();
//	}
//	else
//		this.echo("Either the system or the edge does not exist!");
//},