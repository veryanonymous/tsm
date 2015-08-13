var System = function(name, structure) {
	this.name = typeof name !== 'undefined' ? name : "";
	this.structure = typeof structure !== 'undefined' ? structure : new Structure();
}

System.prototype.toString = function systemToString() {
	return 'Name: ' + this.name + '\nStructure: ' + this.structure.toString();
};