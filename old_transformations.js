var paxos = function(agent, n) {
	// Paxos transformation creates new client and server agents:
	// Server: Replica, Server
	// Client: Matcher, Client, Proxy
	
	// When transforming an agent, it gets a Replica to the left
	// And the pre and post connect functions change:
	// When preconnecting to a Paxos agent, the Client gets a Proxy
	// attached to the right
	// When postconnecting to a Paxos agent, the Client gets a Matcher
	// attached to the left
	
	var proxy,node,replica,system,replicas;
	var i,j;
	replicas = [];
	system = new System(agent.name);
	for (i = 0; i < n; i++) {
		replica = new Agent(agent.name+"/replica"+i.toString(), "omnids.paxos.replica");
		node = new Agent(agent.name+"/"+agent.name+i.toString(), agent.module);
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
	systemToPreconnect = createSystemfromAgent(new Agent(agent.name+"/proxy", "omnids.paxos.proxy"));
	system.preconnectSystems.push(systemToPreconnect);
	
	// Create postconnect system
	systemToPostconnect = createSystemfromAgent(new Agent(agent.name+"/matcher", "omnids.paxos.matcher"));
	system.postconnectSystems.push(systemToPostconnect);

	systems[agent.name] = system;
	return system;
}

var quorum = function(agent, n) {
	var node,proxy,quorum,system;
	system =  new System(agent.name);
	for (i = 0; i < n; i++) {
		quorum = new Agent(agent.name+"/quorum"+i.toString(), "omnids.quorum.quorum");
		node = new Agent(agent.name+"/"+agent.name+i.toString(), agent.module);
		proxy = new Agent(agent.name+"/proxy"+i.toString(), "omnids.quorum.proxy");
        
		system.graph.addNodesFrom([quorum, node, proxy]);
		system.graph.addEdge(node, quorum);
		system.graph.addEdge(quorum, proxy);
		system.inputNodes.push(node);
		system.outputNodes.push(proxy);
	 }
	systems[agent.name] = system;
	return system;
}


