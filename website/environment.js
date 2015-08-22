// There is only one environment

var Environment = function(graph) {
	// Graph of the environment, contains systems
	this.graph = typeof graph !== 'undefined' ? graph : new jsnx.DiGraph();
	// Contains the updates to the environment
	this.history_html = "";
}


Environment.prototype.replace = function(oldSystem, newSystem) {
	// Replaces oldSystem with newSystem in this Environment
	// The connections to input nodes of oldSystem should be replaced with connections to inputNodes of newSystem
	var nodesToConnectToInputs = [];
	var nodesToConnectToOutputs = [];
	var i,j;
	for (i = 0; i < this.graph.edges().length; i++) {
		// Go through the edges
		if (oldSystem.inputNodes.indexOf(this.graph.edges()[i][1]) > -1)
			nodesToConnectToInputs.push(this.graph.edges()[i][0]);
		if (oldSystem.outputNodes.indexOf(this.graph.edges()[i][0]) > -1)
			nodesToConnectToOutputs.push(this.graph.edges()[i][1]);
	}
	// TODO: Adjust input and outputNodes!
	// If the inputNodes of this are the inputNodes of oldSubSystem, replace with newSubSystem's inputNodes
	// If the outputNodes of this are the outputNodes of oldSubSystem, replace with newSubSystem's outputNodes
	
	// Remove nodes and edges that are in the oldSubSystem
	this.graph.removeNodesFrom(oldSystem.graph.nodes());
	// Add nodes and edges from the newSubSystem
	this.graph.addEdgesFrom(newSystem.graph.edges());
	
	// Add new connections to nodes outside given system
	for (i = 0; i < nodesToConnectToInputs.length; i++) {
		for (j = 0; j < newSystem.inputNodes.length; j++) {
			this.graph.addEdge(nodesToConnectToInputs[i], newSystem.inputNodes[j]);
		}
	}
	for (i = 0; i < nodesToConnectToOutputs.length; i++) {
		for (j = 0; j < newSystem.outputNodes.length; j++) {
			this.graph.addEdge(nodesToConnectToOutputs[i], newSystem.outputNodes[j]);
		}
	}
}

Environment.prototype.toString = function() {
	return 'Systems: ' + this.graph.nodes().toString()+ '\n';
};

// TRANSFORMATIONS
Environment.prototype.paxos = function(name, n) {
	// Paxos transformation creates new client and server casms:
	// Server: Replica, Server
	// Client: Matcher, Client, Proxy
	
	// When transforming a casm, it gets a Replica to the left
	// And the pre and post connect functions change:
	// When preconnecting to a PaxosCASM, the Client gets a Proxy
	// attached to the right
	// When postconnecting to a PaxosCASM, the Client gets a Matcher
	// attached to the left
	
	var i, j, k, system;	
	// Find the system!
	for (i = 0; i < this.graph.nodes().length; i++) {
		if (name == this.graph.nodes()[i].name) {
			// Found it! Transform!
			// TODO: For now the System has to be one CASM
			var casm = this.graph.nodes()[i].graph.nodes()[0];
			this.graph.nodes()[i].graph.removeNode(this.graph.nodes()[i].graph.nodes()[0]);
			
			var replicas = [];
			this.graph.nodes()[i].inputNodes = [];
			this.graph.nodes()[i].outputNodes = [];
			for (j = 0; j < n; j++) {
				var replica = new CASM(this.graph.nodes()[i].name+"/replica"+j.toString(), "omnids.paxos.replica", box);
				this.graph.nodes()[i].graph.addNode(replica);
				replicas.push(replica);
				var node = new CASM(this.graph.nodes()[i].name+"/"+casm.name+j.toString(), casm.module, casm.box);
				this.graph.nodes()[i].graph.addNode(node);
				this.graph.nodes()[i].graph.addEdge(replica, node);
				this.graph.nodes()[i].inputNodes.push(replica);
				this.graph.nodes()[i].outputNodes.push(node);
			}
			// Add edges between replicas
			for (j = 0; j < n; j++){
				for (k = j+1; k < n; k++) {
					this.graph.nodes()[i].graph.addEdge(replicas[k], replicas[j]);
					this.graph.nodes()[i].graph.addEdge(replicas[j], replicas[k]);
				}
			}
			// For every edge that is directed to this system, append proxy to that system!
			for (j = 0; j < this.graph.edges().length; j++) {
				if (this.graph.edges()[j][1] == this.graph.nodes()[i]) {
					// Add proxy!
					var proxy = new CASM(this.graph.edges()[j][0].name+"/proxy"+i.toString(), "omnids.paxos.proxy", box);
					this.graph.edges()[j][0].graph.addNode(proxy);
					for (k = 0; k < this.graph.edges()[j][0].outputNodes.length; k++)
						this.graph.edges()[j][0].graph.addEdge(this.graph.edges()[j][0].outputNodes[k], proxy);
					this.graph.edges()[j][0].outputNodes = [proxy];
				}
			}
			// Set preconnect function
			this.graph.nodes()[i].preconnect = function(system) {
				var proxy = new CASM(system.name+"/proxy"+i.toString(), "omnids.paxos.proxy", box);
				system.graph.addNode(proxy);
				for (var k = 0; k < system.outputNodes.length; k++)
					system.graph.addEdge(system.outputNodes[k], proxy);
				system.outputNodes = [proxy];
			}
			
			
			// For every edge that is directed from this system, prepend matcher to that system!
			for (j = 0; j < this.graph.edges().length; j++) {
				if (this.graph.edges()[j][0] == this.graph.nodes()[i]) {
					// Add proxy!
					var matcher = new CASM(this.graph.edges()[j][0].name+"/matcher"+i.toString(), "omnids.paxos.matcher", box);
					this.graph.edges()[j][1].graph.addNode(matcher);
					for (k = 0; k < this.graph.edges()[j][1].inputNodes.length; k++)
						this.graph.edges()[j][1].graph.addEdge(matcher, this.graph.edges()[j][1].inputNodes[k]);
					this.graph.edges()[j][1].inputNodes = [matcher];
				}
			}
			
			// Set postconnect function
			this.graph.nodes()[i].postconnect = function(system) {
				var matcher = new CASM(system.name+"/matcher"+i.toString(), "omnids.paxos.matcher", box);
				system.graph.addNode(matcher);
				for (var k = 0; k < system.inputNodes.length; k++)
					system.graph.addEdge(matcher, system.inputNodes[k]);
				system.inputNodes = [matcher];
			}

			return 1;
		}
	}
	return 0;
}


Environment.prototype.connect = function(name1, name2) {
	var i, system1, system2;
	// Find the systems
	for (i = 0; i < this.graph.nodes().length; i++) {
		if (name1 == this.graph.nodes()[i].name)
			system1 = this.graph.nodes()[i];
		if (name2 == this.graph.nodes()[i].name)
			system2 = this.graph.nodes()[i];
	}
	
	if (system1 && system2) {	
		this.graph.addEdge(system1, system2);
		// If system1 has a postconnect, edit system2
		if (system1.postconnect) system1.postconnect(system2);
		// If system2 has a preconnect, edit system1
		if (system2.preconnect) system2.preconnect(system1);
		return 1;
	}
	return 0;

}
