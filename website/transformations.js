// TRANSFORMATIONS
var shard = function(system, n) {
	// Find the system!
	var system = this.getSystemByName(systemname);
	if (!system)
		return false;
	console.log("Sharding system!");
	// Transform!
	// Add client proxy
	var clientproxy = new Agent(system.name+"/cproxy", "omnids.shard.clientproxy");
	system.graph.addNode(clientproxy);
	system.graph.addEdge(system.systemagent, clientproxy);
	// Add replicas and main agents
	for (var j = 0; j < n; j++) {
		var shard = new Agent(system.name+"/shard"+j.toString(), system.systemagent.module);
		system.graph.addNode(shard);
		system.graph.addEdge(system.systemagent, shard);
		var serverproxy = new Agent(system.name+"/sproxy"+j.toString(), "omnids.shard.serverproxy");
		system.graph.addNode(serverproxy);
		system.graph.addEdge(system.systemagent, serverproxy);

	}
	this.updateSystem(systemname, system);
	return true;
}

var encrypt = function(system) {
	// Find the system!
	var system = this.getSystemByName(systemname);
	if (!system)
		return false;
	console.log("Encrypting system!");
	// Transform!
	// Add encrypter & decrypter
	var preEncrypter = new Agent(system.name+"/pre_encrypter", "omnids.encrypter");
	var postEncrypter = new Agent(system.name+"/post_encrypter", "omnids.encrypter");
	var preDecrypter = new Agent(system.name+"/pre_decrypter", "omnids.decrypter");
	var postDecrypter = new Agent(system.name+"/post_decrypter", "omnids.decrypter");
	var main = new Agent(system.name+"/main", system.systemagent.module);
	console.log("Created agents!");
	// Add new agents
	system.graph.addNode(preEncrypter);
	system.graph.addNode(postEncrypter);
	system.graph.addNode(preDecrypter);
	system.graph.addNode(postDecrypter);
	system.graph.addNode(main);
	console.log("Added nodes!");
	
	// Add new level of the LATT with edges
	system.graph.addEdge(system.systemagent, preEncrypter);
	system.graph.addEdge(system.systemagent, postEncrypter);
	system.graph.addEdge(system.systemagent, preDecrypter);
	system.graph.addEdge(system.systemagent, postDecrypter);
	system.graph.addEdge(system.systemagent, main);
	console.log("Added edges!");
	
	this.updateSystem(systemname, system);
	return true;
}

var paxos = function(systemname, n) {
	// Find the system!
	var system = this.getSystemByName(systemname);
	if (!system)
		return false;
	console.log("Replicating system with Paxos!");
	// Transform!
	// Add proxy
	var proxy = new Agent(system.name+"/serverproxy", "omnids.paxos.proxy");
	system.graph.addNode(proxy);
	system.graph.addEdge(system.systemagent, proxy);
	// Add replicas and main agents
	for (var j = 0; j < n; j++) {
		var replica = new Agent(system.name+"/replica"+j.toString(), "omnids.paxos.replica");
		system.graph.addNode(replica);
		system.graph.addEdge(system.systemagent, replica);
		var main = new Agent(system.name+"/main"+j.toString(), system.systemagent.module);
		system.graph.addNode(main);
		system.graph.addEdge(system.systemagent, main);
	}
	this.updateSystem(systemname, system);
	return true;
}
