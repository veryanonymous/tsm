// For every box, we know the Probability for Failure,
// Compute, Memory, Storage and Network Resources
// FaultTolerance = Probability of Failure between 0.0-1.0
// Compute = #CPU * ClockSpeed
// Memory = Capacity in GiB
// Storage = Capacity in GB
// Network = Gbit/sec

var resources = {
	FAULTTOLERANCE: 0,
	COMPUTE: 1,
	MEMORY: 2,
	STORAGE: 3,
	NETWORK: 4,
	SECURITY: 5
};

/////// WORKLOAD ///////
var workload = 100; 	//operations per second

/////// SLO ///////
// slo includes the requirements that need to
// be fulfilled by the system
var slo = 0;

slo[resources.FAULTTOLERANCE] = 0.7;
slo[resources.COMPUTE] = 2.4;
slo[resources.MEMORY] = 4;
slo[resources.STORAGE] = 100;
slo[resources.NETWORK] = 1;
slo[resources.SECURITY] = 0; // 0 for no security 1 for yes security

/////// ENVIRONMENT ///////
// boxes include the environment information
var boxes = new Array();

boxes["127.0.0.1:14000"] = new Array();
boxes["127.0.0.1:14000"][resources.COMPUTE] = 4 * 2.4; // in GHz
boxes["127.0.0.1:14000"][resources.MEMORY] = 4; // in GiB
boxes["127.0.0.1:14000"][resources.STORAGE] = 40; // in GB
boxes["127.0.0.1:14000"][resources.NETWORK] = 40; // Gbit/sec

boxes["127.0.0.1:14001"] = new Array();
boxes["127.0.0.1:14001"][resources.COMPUTE] = 1 * 2.4; // in GHz
boxes["127.0.0.1:14001"][resources.MEMORY] = 2; // in GiB
boxes["127.0.0.1:14001"][resources.STORAGE] = 20; // in GB
boxes["127.0.0.1:14001"][resources.NETWORK] = 10; // Gbit/sec

boxes["127.0.0.1:14002"] = new Array();
boxes["127.0.0.1:14002"][resources.COMPUTE] = 1 * 2.4; // in GHz
boxes["127.0.0.1:14002"][resources.MEMORY] = 1; // in GiB
boxes["127.0.0.1:14002"][resources.STORAGE] = 1; // in GB
boxes["127.0.0.1:14002"][resources.NETWORK] = 1; // Gbit/sec

var packing = function(workload, slo, environment) {
	// For now ignore the workload
	console.log("Packing..");

}

packing();