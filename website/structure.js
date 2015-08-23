var Structure = function(inputNodes, outputNodes, graph) {
	this.graph = typeof graph !== 'undefined' ? graph : new jsnx.DiGraph();
	this.inputNodes = typeof inputNodes !== 'undefined' ? inputNodes : [];
	this.outputNodes = typeof outputNodes !== 'undefined' ? outputNodes : [];
}

Structure.prototype.connect = function(givenStructure) {
	// Connects two Structures
    // Add new nodes
	this.graph.addNodesFrom(givenStructure.graph.nodes());
	// Add new edges
    this.graph.addEdgesFrom(givenStructure.graph.edges());
    // Connect Structures (this creates gates)
    for (i = 0; i < this.outputNodes.length; i++) {
    	for (j = 0; j < givenStructure.inputNodes.length; j++) {
    		// Create new edges
    		this.graph.addEdge(this.outputNodes[i], givenStructure.inputNodes[j]);
    	}
    }
    // Adjust output nodes
	this.outputNodes = [];
	for (i = 0; i < givenStructure.outputNodes.length; i++) {
		this.outputNodes.push(givenStructure.outputNodes[i]);
	}
};

Structure.prototype.replace = function(oldSystem, newSystem) {
	// Replaces oldSystem with newSystem in given structure
	// The connections to input nodes of oldSystem should be replaced with connections to inputNodes of newSystem
	var nodesToConnectToInputs = [];
	var nodesToConnectToOutputs = [];
	var i,j;
	for (i = 0; i < this.graph.edges().length; i++) {
		// Go through the edges
		if (oldSystem.structure.inputNodes.indexOf(this.graph.edges()[i][1]) > -1)
			nodesToConnectToInputs.push(this.graph.edges()[i][0]);
		if (oldSystem.structure.outputNodes.indexOf(this.graph.edges()[i][0]) > -1)
			nodesToConnectToOutputs.push(this.graph.edges()[i][1]);
	}
	// TODO: Adjust input and outputNodes!
	// If the inputNodes of this are the inputNodes of oldSystem, replace with newSystem's inputNodes
	// If the outputNodes of this are the outputNodes of oldSystem, replace with newSystem's outputNodes

	// Remove nodes and edges that are in the oldSystem
	this.graph.removeNodesFrom(oldSystem.structure.graph.nodes());
	// Add nodes and edges from the newSystem
	this.graph.addEdgesFrom(newSystem.structure.graph.edges());

	// Add new connections to nodes outside given system
	for (i = 0; i < nodesToConnectToInputs.length; i++) {
		for (j = 0; j < newSystem.structure.inputNodes.length; j++) {
			this.graph.addEdge(nodesToConnectToInputs[i], newSystem.structure.inputNodes[j]);
		}
	}
	for (i = 0; i < nodesToConnectToOutputs.length; i++) {
		for (j = 0; j < newSystem.structure.outputNodes.length; j++) {
			this.graph.addEdge(nodesToConnectToOutputs[i], newSystem.structure.outputNodes[j]);
		}
	}
};

Structure.prototype.toString = function structureToString() {
	var rstr = 'Nodes: ' + this.graph.nodes().toString()+ '\nEdges: ';
	for (i = 0; i < this.graph.edges().length; i++) {
		rstr += '(' + this.graph.edges()[i][0].name + ',' + this.graph.edges()[i][1].name + ');';
	}
	return rstr.substring(0, rstr.length-1);
};
