// All the objects in the program
var ObjectsMap = {};

// Objects that on the device-setup-area (not yet connected)
var ObjectsOnSetupAreaMap = {};

// Objects that are connected to the board
var ConnectedObjectsMap = {};

// Values (variables) that are available to use in the program
var RegisteredValuesMap = {};

// All the connections
var ConnectionsMap = {};

var CodeIncludes = {};
var CodeLibraryFunctions = {};
// If library need to be initialize at setup make sure that we have only one initialize (if the projects has multiple object from the same library)
var CodeSetupInitialize = {};

var object_index = 0;
var disableObjectCounter = false;
var Ports = [];

var beautify_in_progress = false;
var active_object_settings = "";
var autosaveTimer = null;
var autosaveInterval = 0;
var NOTIFICATION_LEFT_IN = 75;
var NOTIFICATION_LEFT_OUT = 100;

var wifiNetworks;
var currentActiveWifiCell = "";
var isConnecting = false;

var swapPortFrom = null;

function PepinoProject(name, description, file) {
    this.Name = (typeof name !== 'undefined') ? name : null;
	this.Description = (typeof description !== 'undefined') ? description : null;
    this.Filename = (typeof file !== 'undefined') ? file : null;
}

var currentActiveProject = new PepinoProject();