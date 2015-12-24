function Agent (name, module) {
	this.name = typeof name !== 'undefined' ? name : "";
	this.module = typeof module !== 'undefined' ? module : ""
};

Agent.prototype.serialize = function() {
	var rjson = {"name":this.name,"module":this.module};
	return JSON.stringify(rjson);
};

Agent.prototype.toString = function() {
	return this.name;
};