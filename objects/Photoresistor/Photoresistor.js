var PhotoresistorSetupSourceEndpoint = {
	endpoint:"Rectangle",
	paintStyle:{ fillStyle:"#ebb600", width: 25, height: 25 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	connectorHoverStyle:connectorHoverStyle,
    scope: 'analog'
};

var PhotoresistorSourceEndpoint = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	connectorHoverStyle:connectorHoverStyle,
	overlays:[
		[ "Label", { 
			location:[1.6, 0.5], 
			label:"Next",
			cssClass:"PhotoresistorEndpointLabel" 
		} ]
	]      
};

var PhotoresistorTargetEndpoint = {
	endpoint: "Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	maxConnections:-1,
	dropOptions:{ hoverClass:"hover", activeClass:"active" },
	isTarget:true,
    beforeDrop: function(params) { 
        return (!(params.sourceId == params.targetId));
	},    
	overlays:[
		[ "Label", { 
			location:[-0.5, 0.5], 
			label:"In",
			cssClass:"PhotoresistorEndpointLabel" 
		} ]
	]     
};	
			
function ObjectPhotoresistor (port) {
    this.Chain = {};
	this.Name = "Photoresistor";
    this.Id = this.Name;
    this.Category = "Analog";
	this.Port = (port == undefined) ? "A0" : port ;
	this.Chain["Next"] = null;
	this.Position = new ObjectPosition();
	this.SetupMode = false;
    this.Variables = [];
    this.PassedVariables;
}

ObjectPhotoresistor.prototype.GetCode = function(passedVars) {
    if (typeof passedVars != 'undefined')
    {
        this.PassedVariables = passedVars;
    }
    else
    {
        this.PassedVariables = [];
    }
    
    var CodeGlobal = "";
    var CodeLoop = "";
	var CodeSetup = "";
    var CodeFunctions = "";
	var obj = null;
		
	if (ObjectsMap[this.Id].Chain["Next"] != null) {
		var obj = ObjectsMap[this.Chain["Next"]].GetCode(passedVars);
		CodeGlobal = obj.Global;
        CodeLoop = obj.Loop;
		CodeSetup = obj.Setup;
        CodeFunctions = obj.CodeFunctions;
	}
    
    if (this.SetupMode == false)
    {
        if (typeof RegisteredValuesMap[this.Variables[0]] == 'undefined')
            RegisteredValuesMap[this.Variables[0]] = new ObjectRegisteredValue(this.Id, ' analog value','_analogValue');
    }
	
	var selfGlobalCode = "int " + RegisteredValuesMap[this.Variables[0]].VariableName + " = 0;";
    
	var selfLoopCode = RegisteredValuesMap[this.Variables[0]].VariableName + " = analogRead(" + this.Port + ");";

	return  new ObjectCode(selfLoopCode + CodeLoop, CodeSetup, selfGlobalCode + CodeGlobal, CodeFunctions);
}

ObjectPhotoresistor.prototype.handleNewOutConnection  = function(conn) {
    this.Chain["Next"] = conn.targetId;    
}

ObjectPhotoresistor.prototype.handleNewInConnection  = function(conn) {
}

ObjectPhotoresistor.prototype.handleDeleteOutConnection  = function(conn) {
    this.Chain["Next"] = null;    
}

ObjectPhotoresistor.prototype.handleDeleteInConnection  = function(conn) {
}

ObjectPhotoresistor.prototype.Draw  = function(offset, working_area) {
	var body = "";
    
	CreateObjectElement(this, "Photoresistor", offset, working_area);
	if (this.SetupMode == false) { $("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');"); }
	var sourceUUID = this.Id + "_OutConnection_Next";  
    var endpointAnchor = (this.SetupMode == true) ? [[0.98, 0.5, 0, 0], [0.5, 0.98, 0, 0], [0.05, 0.5, 0, 0], [0.5, 0, 0, 0]] : [0.9, 0.62, 0, 0];
    jsPlumb.addEndpoint(this.Id, ((this.SetupMode == true) ? PhotoresistorSetupSourceEndpoint : PhotoresistorSourceEndpoint) , { anchor: endpointAnchor, uuid:sourceUUID });
	sourceUUID = this.Id + "_InConnection";
    if (this.SetupMode == false)
    {
        jsPlumb.addEndpoint(this.Id, PhotoresistorTargetEndpoint, { anchor:[0.10, 0.62, 0, 0], uuid:sourceUUID });
        
        body += "<div id=\"" + this.Id + "_port_number_div\" style=\"font-family: 'ohw-font'; color: white; position: absolute; top: 25px; right: 13px; width: 25px; text-align:center\">" + this.Port + "</div>";
    }
    else
    {
        body += RemoveButton(this.Id);
    }    
	document.getElementById(this.Id).innerHTML = body;
	return this.Id;
}

ObjectPhotoresistor.prototype.AfterDraw = function()
{
    if (this.SetupMode == true) return;
    this.Variables.push(this.Id + "_0");
}

ObjectPhotoresistor.prototype.UpdatePort = function UpdatePort(port) {
	this.Port = port;
    $("#"  + this.Id +"_port_number_div").html(this.Port);
	UpdateCode();
}


ObjectPhotoresistor.prototype.DrawSettingsPanel  = function() {
	var body = "";

	return body;
}