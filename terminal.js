function isNumber(obj) { return !isNaN(parseFloat(obj)) }

var App = {
    echo: function(text) {
        this.echo(text);
    },
    help: function() {
        this.echo("Available commands:");
        this.echo(" create [NODE]               creates a NODE with given name");
        this.echo(" remove [NODE]               removes the NODE with given name");
        this.echo(" connect [NODE1] [NODE2]     connects NODE1 to NODE2");
        this.echo(" disconnect [NODE1] [NODE2]  disconnects NODE1 from NODE2");
        this.echo(" paxos [NODE]                replicates given NODE with paxos");
        this.echo(" quorum [NODE]               replicates given NODE with quorum");
        this.echo(" encrypt [NODE1] [NODE2]     encrypts connection between NODE1");
        this.echo("                             and NODE2");
        this.echo(" state                       prints the state of the system");
        this.echo(" help                        prints this help screen");
        this.echo("");
    },
    restart: function() {
    	restart();
    	this.echo("Restarted the system! All CASMs are removed.");
    	updateState();
    },
    create: function(name) {
    	var module = "module.module";
    	var box = "127.0.0.1:12000";

    	createElement(name, module, box);
    	this.echo("Added System " + name);
    	updateState();
    },
    remove: function(name) {
    	removeElement(name);
    	this.echo("Removed System " + name);
    	updateState();
    },
    connect: function(name1, name2) {
    	if (connectSystems(name1, name2)) {
    		updateState();
    	}
    	else
    		this.echo("System does not exist!");
    },
    disconnect: function(name1, name2) {
    	if (disconnectSystems(name1, name2)) {
    		updateState();
    	}
    	else
    		this.echo("Either the system or the edge does not exist!");
    },
    paxos: function(name, n) {
    	if (!isNumber(n))
    		this.echo("Second argument must be an integer!");
    	else if (paxosSystem(name, n))
    		updateState();
    	else
    		this.echo("CASM " + name + " does not exist!");
    },
    quorum: function(CASM, n) {
    	if (!isNumber(n))
    		this.echo("Second argument must be an integer!");
    	else if (quorumCASM(CASM, n))
    		updateState();
    	else
    		this.echo("CASM " + CASM + " does not exist!");
    },
    example: function() {
    	this.echo("Creating example graph.");
    	examplegraph();
    	updateState();
    },
    state: function() {
    	this.echo(environment.toString());
    },
    about: function() {
        this.echo("To get more information about Transformations, go to <a href='http:///' target='_blank'>Transformations</a>", {raw:true});
    },
}

jQuery(document).ready(function($) {
    $('#terminal').terminal(App, {
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