var System = function(name, graph, inputNodes, outputNodes) {
	this.name = typeof name !== 'undefined' ? name : "";
	this.graph = typeof graph !== 'undefined' ? graph : new jsnx.DiGraph();
	this.inputNodes = typeof inputNodes !== 'undefined' ? inputNodes : [];
	this.outputNodes = typeof outputNodes !== 'undefined' ? outputNodes : [];
	
	this.preconnect = 0;
	this.postconnect = 0;
}

System.prototype.preconnect = function(system) {
	
};

System.prototype.postconnect = function(givenSystem) {
	// Connects the givenSystem to the outputNodes of the system
    // Add new nodes
	this.graph.addNodesFrom(givenSystem.graph.nodes());
	// Add new edges
    this.graph.addEdgesFrom(givenSystem.graph.edges());
    // Connect systems
    for (i = 0; i < this.outputNodes.length; i++) { 
    	for (j = 0; j < givenSystem.inputNodes.length; j++) {
    		// Create new edges
    		this.graph.addEdge(this.outputNodes[i], givenSystem.inputNodes[j]);
    	}	    
    }
    // Adjust outputNodes
	this.outputNodes = [];
	for (i = 0; i < givenSystem.outputNodes.length; i++) {
		this.outputNodes.push(givenSystem.outputNodes[i]);
	}
};

System.prototype.state = function() {
	var rstr = 'Name: ' + this.name + '\nNodes: ' + this.graph.nodes().toString()+ '\nEdges: ';
	for (i = 0; i < this.graph.edges().length; i++) {
		rstr += '(' + this.graph.edges()[i][0].name + ',' + this.graph.edges()[i][1].name + ');';
	}
	return rstr.substring(0, rstr.length-1);
}

System.prototype.toString = function() {
	return this.name;
};
