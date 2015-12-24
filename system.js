var System = function(name, graph) {
	this.name = typeof name !== 'undefined' ? name : "";
	this.graph = typeof graph !== 'undefined' ? graph : new jsnx.DiGraph();
	this.systemagent = new Agent(name);
	this.graph.addNode(this.systemagent);
}

System.prototype.state = function() {
	var rstr = 'Name: ' + this.name + '\nNodes: ' + this.graph.nodes().toString()+ '\nEdges: ';
	for (i = 0; i < this.graph.edges().length; i++) {
		rstr += '(' + this.graph.edges()[i][0].name + ',' + this.graph.edges()[i][1].name + ');';
	}
	return rstr.substring(0, rstr.length-1);
}

System.prototype.getLeaves = function() {
	var leaves = [];
	for (var node in this.graph.outDegree()._values) {
		if (this.graph.outDegree()._values[node] == 0) {
			// Leaf node!
			leaves.push(node);
		}
	}
	console.log("Leaf nodes: " + leaves);
	return leaves;
}

System.prototype.serialize = function() {
	// This is the low-level representation, includes system nodes and edges
	// TODO: include modules.
	var nodes = '';
	for (i = 0; i < this.graph.nodes().length; i++) {
		nodes += this.graph.nodes()[i] + ",";
	}
	nodes = nodes.slice(0,-1);
	
	var edges = '';
	// Add edge pairs separated with semicolons: (a,b);(b,a)
	for (var i = 0; i < this.graph.edges().length; i++)
		edges += "("+this.graph.edges()[i]+");"
	edges = edges.slice(0,-1);

	var rjson = {"nodes":nodes,"edges":edges};
	console.log("Created JSON string: " + nodes);
	console.log(rjson);
	return JSON.stringify(rjson);
}

System.prototype.toString = function() {
	var nodes = '';
	for (i = 0; i < this.graph.nodes().length; i++) {
		nodes += this.graph.nodes()[i] + "\n";
	}
	var edges = '';
	// Add edge pairs separated with semicolons: (a,b);(b,a)
	for (var i = 0; i < this.graph.edges().length; i++)
		edges += "("+this.graph.edges()[i]+")\n"
	edges = edges.slice(0,-1);
	console.log("Nodes: " + nodes);
	console.log("Edges: " + edges);
	
	return "System " + this.name + "\nNodes:\n" + nodes + "Edges:\n" + edges;
};
