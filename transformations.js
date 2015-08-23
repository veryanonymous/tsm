var paxos = function(casm, n) {
	// Paxos transformation creates new client and server casms:
	// Server: Replica, Server
	// Client: Matcher, Client, Proxy

	// When transforming a casm, it gets a Replica to the left
	// And the pre and post connect functions change:
	// When preconnecting to a PaxosCASM, the Client gets a Proxy
	// attached to the right
	// When postconnecting to a PaxosCASM, the Client gets a Matcher
	// attached to the left

	var proxy,node,replica,system,replicas;
	var i,j;
	replicas = [];
	system = new System(casm.name);
	for (i = 0; i < n; i++) {
		replica = new CASM(casm.name+"/replica"+i.toString(), "omnids.paxos.replica", box);
		node = new CASM(casm.name+"/"+casm.name+i.toString(), casm.module, casm.box);
		replicas.push(replica);
		system.graph.addNodesFrom([replica, node]);
		system.graph.addEdge(replica, node);
		system.outputNodes.push(node);
	}

	// Add edges between replicas
	for (i = 0; i < n; i++){
		for (j = i+1; j < n; j++) {
			system.graph.addEdge(replicas[i], replicas[j]);
			system.graph.addEdge(replicas[j], replicas[i]);
		}
	}
	// Create preconnect system
	systemToPreconnect = createSystemfromCASM(new CASM(casm.name+"/proxy", "omnids.paxos.proxy"));
	system.preconnectSystems.push(systemToPreconnect);

	// Create postconnect system
	systemToPostconnect = createSystemfromCASM(new CASM(casm.name+"/matcher", "omnids.paxos.matcher"));
	system.postconnectSystems.push(systemToPostconnect);

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

		system.graph.addNodesFrom([quorum, node, proxy]);
		system.graph.addEdge(node, quorum);
		system.graph.addEdge(quorum, proxy);
		system.inputNodes.push(node);
		system.outputNodes.push(proxy);
	 }
	systems[casm.name] = system;
	return system;
}


