//var nodes =  ['client1', 'quorum0', 'quorum1', 'proxy', 'server', 'client0'];
//var edges = [['client1', 'quorum1'], ['quorum0', 'proxy'], ['quorum1', 'proxy'], ['proxy', 'server'], ['client0', 'quorum0']];

var System = function(inputNodes, outputNodes, graph) {
	this.graph = typeof graph !== 'undefined' ? graph : new jsnx.DiGraph();
	this.inputNodes = typeof inputNodes !== 'undefined' ? inputNodes : [];
	this.outputNodes = typeof outputNodes !== 'undefined' ? outputNodes : [];
}

System.prototype.connect = function(givenSystem) {
	// Connects two systems
    // Add new nodes
	console.log("Adding nodes: ", givenSystem.graph.nodes().toString())
    this.graph.addNodesFrom(givenSystem.graph.nodes());
	// Add new edges
    console.log("Adding edges: ", givenSystem.graph.edges())
    this.graph.addEdgesFrom(givenSystem.graph.edges());
    // Connect systems (this creates gates)
    for (i = 0; i < this.outputNodes.length; i++) { 
    	for (j = 0; j < givenSystem.inputNodes.length; j++) {
    		console.log("Creating new Edge: ", this.outputNodes[i], "-->", givenSystem.inputNodes[j]);
    		this.graph.addEdge(this.outputNodes[i], givenSystem.inputNodes[j]);
    	}	    
    }
    // Adjust output nodes
	this.outputNodes = [];
	for (i = 0; i < givenSystem.outputNodes.length; i++) {
		this.outputNodes.push(givenSystem.outputNodes[i]);
	}
};

System.prototype.toString = function systemToString() {
  return 'Nodes: ' + this.graph.nodes().toString() + 'Edges: ' + this.graph.edges().toString() + 'InputNodes: ' + this.inputNodes.toString() + 'OutputNodes: ' + this.outputNodes.toString();
};
