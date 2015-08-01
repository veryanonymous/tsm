var box = "127.0.0.1:12000";
var state = "";
var system = new System();
var nodes = [];
var edges = [];

function isNumber(obj) { return !isNaN(parseFloat(obj)) }

var paxos = function(casm, n) {
	var node,replica,system;
	system =  new System();
	if (isNumber(n)) {
		for (i = 0; i < n; i++) {
			replica = new CASM("replica".concat(i.toString()), "omnids.paxos.replica", box);
			node = new CASM(casm.name.concat(i.toString()), casm.module, casm.box);
			system.graph.addNodesFrom([replica, node]);
			system.graph.addEdge(replica, node);
			system.inputNodes.push(replica);
			system.outputNodes.push(node);
		 }
	 }
	 return system;
}

var quorum = function(casm, n) {
	var node,proxy,system,quorum;
	system =  new System();
	if (isNumber(n)) {
		for (i = 0; i < n; i++) {
			quorum = new CASM("quorum".concat(i.toString()), "omnids.quorum.quorum", box);
			node = new CASM(casm.name.concat(i.toString()), casm.module, casm.box);
			proxy = new CASM("proxy".concat(i.toString()), "omnids.quorum.proxy", box);
	        
			system.graph.addNodesFrom([quorum, node, proxy]);
			system.graph.addEdge(node, quorum);
			system.graph.addEdge(quorum, proxy);
			system.inputNodes.push(node);
			system.outputNodes.push(proxy);
		 }
	 }
	 return system;
}

var createCASM = function(name, module, box) {
	var casm =  new CASM(name, module, box);
	state += "Added " + casm.name + "<br>";
	var casmSystem = new System([casm], [casm]);
	casmSystem.graph.addNode(casm);
	system.connect(casmSystem);
	nodes = system.graph.nodes();
	edges = system.graph.edges();
}

var replicateCASM = function(name) {
	for (i = 0; i < system.graph.nodes().length; i++) {
		if (system.graph.nodes()[i].name == name){
			replicatedSystem = paxos(system.graph.nodes()[i], 3);
			system.connect(replicatedSystem);
			nodes = system.graph.nodes();
			edges = system.graph.edges();
		}
	}
}

var main = function() {
  var client =  new CASM("client", "omnids.client", box);
  var server =  new CASM("server", "omnids.server", box);
  
  var clientSystem = new System([client], [client]);
  clientSystem.graph.addNode(client);
  var serverSystem = new System([server], [server]);
  serverSystem.graph.addNode(server);
  serverSystem = paxos(server, 3);
  clientSystem = quorum(client, 3);
  
  clientSystem.connect(serverSystem);
  
  nodes = clientSystem.graph.nodes();
  edges = clientSystem.graph.edges();
}

