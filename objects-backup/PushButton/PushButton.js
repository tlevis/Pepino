var PushButtonSetupSourceEndpoint = {
	endpoint:"Rectangle",
	paintStyle:{ fillStyle:"white", width:25, height: 25, strokeStyle: "black"},
	isSource:true,
	connectorStyle:connectorPaintStyle,
	hoverPaintStyle:connectorHoverStyle,
	connectorHoverStyle:connectorHoverStyle,
    scope: 'digital'
};

var PushButtonSourceEndpoint = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	hoverPaintStyle:connectorHoverStyle,
	connectorHoverStyle:connectorHoverStyle,
	overlays:[
		[ "Label", { 
			location:[1.6, 0.5], 
			label:"Next",
			cssClass:"PushButtonEndpointLabel" 
		} ]
	]
};

var PushButtonTargetEndpoint = {
	endpoint: "Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	hoverPaintStyle:connectorHoverStyle,
	maxConnections:-1,
	dropOptions:{ hoverClass:"hover", activeClass:"active" },
	isTarget:true,
	overlays:[
		[ "Label", { 
			location:[-0.5, 0.5], 
			label:"In",
			cssClass:"PushButtonEndpointLabel" 
		} ]
	]
};	
			
function ObjectPushButton (port) {
    this.Chain = {};
	this.Name = "PushButton";
    this.Id = this.Name;
    this.Category = "Digital";
	this.Port = port;
	this.Chain["Next"] = null;
	this.Position = new ObjectPosition();
	this.SetupMode = false;
}

ObjectPushButton.prototype.GetCode = function() {
	var CodeGlobal = "";
    var CodeLoop = "";
	var CodeSetup = "";
    var CodeFunctions = "";
	var obj = null;
		
	if (ObjectsMap[this.Id].Chain["Next"] != null) {
		var obj = ObjectsMap[this.Chain["Next"]].GetCode();
		CodeGlobal = obj.Global;
        CodeLoop = obj.Loop;
		CodeSetup = obj.Setup;
        CodeFunctions = obj.CodeFunctions;
	}
	
	var selfSetupCode = (Ports["p"+this.Port] == undefined) ? "pinMode(" + this.Port + ", INPUT);" : "";
	Ports["p"+this.Port] = this.Signal;
	
	var selfLoopCode = "";

    selfLoopCode = "digitalRead(" + this.Port +  ");";

	return  new ObjectCode(selfLoopCode + CodeLoop, selfSetupCode + CodeSetup, CodeGlobal, CodeFunctions);
}

ObjectPushButton.prototype.handleNewOutConnection  = function(conn) {
    this.Chain["Next"] = conn.targetId;    
}

ObjectPushButton.prototype.handleNewInConnection  = function(conn) {
}

ObjectPushButton.prototype.handleDeleteOutConnection  = function(conn) {
    this.Chain["Next"] = null;    
}

ObjectPushButton.prototype.handleDeleteInConnection  = function(conn) {
}

ObjectPushButton.prototype.Draw  = function(offset, working_area) {
	var body = "";
    CreateObjectElement(this, "PushButton", offset, working_area);
	if (this.SetupMode == false) { $("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');"); }
	var sourceUUID = this.Id + "_OutConnection_Next";  
    var endpointAnchor = (this.SetupMode == true) ? [[0.98, 0.5, 0, 0], [0.5, 0.98, 0, 0], [0, 0.5, 0, 0], [0.5, 0, 0, 0]] : [0.9, 0.59, 0, 0];
    jsPlumb.addEndpoint(this.Id, ((this.SetupMode == true) ? PushButtonSetupSourceEndpoint : PhotoresistorSourceEndpoint) , { anchor: endpointAnchor, uuid:sourceUUID });
	sourceUUID = this.Id + "_InConnection";
    if (this.SetupMode == false)
    {
        jsPlumb.addEndpoint(this.Id, PhotoresistorTargetEndpoint, { anchor:[0.10, 0.59, 0, 0], uuid:sourceUUID });
        
        body += "<div style=\"font-family: 'ohw-font'; color: white; position: absolute; top: 17px; right: 13px; width: 25px; text-align:center\">" + this.Port + "</div>";
    }
    else
    {
        body += RemoveButton(this.Id);
    }    
	document.getElementById(this.Id).innerHTML = body;
	return this.Id;
}

ObjectPushButton.prototype.DrawSettingsPanel  = function() {

	return "";
}
