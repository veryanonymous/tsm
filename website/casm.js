function CASM (name, module, box) {
	this.name = typeof name !== 'undefined' ? name : "";
	this.module = typeof module !== 'undefined' ? module : "";
	this.box =  typeof module !== 'undefined' ? box : "";
};

CASM.prototype.addGate = function(gate) {
	  this.gate = gate;
};

CASM.prototype.toString = function() {
	return this.name;
};