var box = "127.0.0.1:12000";
var state = "";

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

var addClient = function() {
	var client =  new CASM("client", "omnids.client", box);
	state += "Added " + client + "<br>";
}

var addServer = function() {
	var server =  new CASM("server", "omnids.server", box);
	state += "Added " + server + "<br>";
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

main();