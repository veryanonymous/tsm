// global namespace
// first check whether CASM is already defined
// if yes, then use the existing CASM global object,
// otherwise create an empty object called CASM

var CASM = function (name, module, box) {
	this.name = typeof name !== 'undefined' ? name : "";
	this.module = typeof module !== 'undefined' ? module : "";
	this.box =  typeof module !== 'undefined' ? box : "";
};

CASM.prototype.addGate = function(gate) {
	  this.gate = gate;
};

CASM.prototype.toString = function CASMToString() {
  return this.name;
};