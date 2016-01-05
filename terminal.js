function isNumber(obj) { return !isNaN(parseFloat(obj)) }
var state_html = "";
var environment = new Environment();

var Terminal = {
    echo: function(text) {
        this.echo(text);
    },
    help: function() {
        this.echo("Available commands:");
        this.echo(" create [name]			    creates a system agent with given name");
        this.echo(" remove [name]               removes the node with given name");
        this.echo(" shard [name] [n]            shards given system n-ways");
        this.echo(" latt [name]				    draws the LATT for given system");
        //this.echo(" encrypt [name]				encrypts given system");
        //this.echo(" paxos [name] [n]            replicates given system n-ways with paxos");
        this.echo(" deploy [name]				draws the deployment graph for given system");
        this.echo(" connect [name1] [name2]		connects given system deployments");
        this.echo(" print [name]				prints the LATT for given system");
        this.echo(" systems                     prints all systems in the environment");
        this.echo(" help                        prints this help screen");                        
        this.echo("");
    },
    systems: function() {
    	this.echo(environment.getSystems());
    },
    restart: function() {
    	environment = new Environment();
    	this.echo("Restarted the system! All systems are removed.");
    	updateState();
    },
    create: function(name) {
    	if (environment.addSystem(new System(name))){
    		environment.history_html += "Added system agent " + name + "<br>";
    		this.echo("Added new system: " + name);
    		updateState();
    	}
    	else
    		this.echo("System " + name + " already exists!");
    },
    remove: function(name) {
    	if (environment.removeSystemByName(name)) {
    		this.echo("Removed system " + name);
    		updateState();
    	}
    	else
    		this.echo("System " + name + " does not exist!");
    },
    deploy: function(name) {
    	if (environment.drawDeployment(name))
    		updateState();
    	else
    		this.echo("System " + name + " does not exist!");
    },
    paxos: function(name, n) {
    	if (!isNumber(n))
    		this.echo("Second argument must be an integer!");
    	else if (environment.paxos(name, n))
    		updateState();
    	else
    		this.echo("System " + name + " does not exist!");
    },
    encrypt: function(name) {
    	if (environment.encrypt(name))
    		updateState();
    	else
    		this.echo("System " + name + " does not exist!");
    },
    shard: function(name, n) {
    	if (environment.shard(name, n))
    		updateState();
    	else
    		this.echo("System " + name + " does not exist!");
    },
    connect: function(name1, name2) {
    	if (environment.connect(name1, name2))
    		updateState();
    	else
    		this.echo("System " + name + " does not exist!");
    },
    latt: function(name) {
    	// Draws the LATT of the system with the given name
    	if (environment.drawLATT(name))
    		updateState();
    	else
    		this.echo("System " + name + " does not exist!");
    },
    print: function(name) {
    	// Prints the LATT of the system with the given name
    	if (environment.getSystemByName(name))
    		this.echo(environment.getSystemByName(name).toString());
    	else
    		this.echo("System " + name + " does not exist!");
    },
//    state: function() {
//    	this.echo(environment.toString());
//    },
//    config: function() {
//    	this.echo(environment.serialize());
//    },
    about: function() {
        this.echo("To get more information about Transformations, go to <a href='http:///' target='_blank'>Transformations</a>", {raw:true});
    },
}

jQuery(document).ready(function($) {
    $('#terminal').terminal(Terminal, {
        greetings: "Hi, let's transform some systems!\nYou can start by exploring available commands with help\n",
        prompt: function(p){
            p("$ ");
        },
        onBlur: function() {
            // prevent loosing focus
            return false;
        },
        tabcompletion: true
    });
});