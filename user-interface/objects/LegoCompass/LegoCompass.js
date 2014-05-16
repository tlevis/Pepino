var LegoCompassSetupSourceEndpoint = {
	endpoint:"Rectangle",
	paintStyle:{ fillStyle:"#bbbdb8", width: 25, height: 25 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	connectorHoverStyle:connectorHoverStyle,
    scope: 'lego'
};

var LegoCompassSourceEndpoint = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	connectorHoverStyle:connectorHoverStyle,
	overlays:[
		[ "Label", { 
			location:[1.6, 0.5], 
			label:"Next",
			cssClass:"LegoCompassEndpointLabel" 
		} ]
	]      
};

var LegoCompassTargetEndpoint = {
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
			cssClass:"LegoCompassEndpointLabel" 
		} ]
	]     
};	
			
function ObjectLegoCompass(port) {
    this.Chain = {};
	this.Name = "LegoCompass";
    this.Id = this.Name;
    this.Category = "Lego";
	this.Port = (port == undefined) ? "L1" : port ;
	this.Chain["Next"] = null;
	this.Position = new ObjectPosition();
	this.SetupMode = false;
    this.Variables = [];
    this.PassedVariables;
}

ObjectLegoCompass.prototype.GetCode = function(passedVars) {
    if (typeof passedVars != 'undefined')
    {
        this.PassedVariables = passedVars;
    }
    else
    {
        this.PassedVariables = [];
    }
    
    var i2c = getI2C();
    CodeIncludes[i2c.Name] = i2c.Include;
    CodeLibraryFunctions[i2c.Name] = i2c.Functions;
    CodeSetupInitialize[i2c.Name] = i2c.Setup;
    
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
            RegisteredValuesMap[this.Variables[0]] = new ObjectRegisteredValue(this.Id, ' lego value','_legoValue');
    }
	
	var selfGlobalCode = "int " + RegisteredValuesMap[this.Variables[0]].VariableName + " = 0;";
    
    var selfLoopCode = "byte " + this.Id + "_buffer[2];\n";
    selfLoopCode += "readFrom(0x01, 0x44, " + this.Id + "_buffer, 2);\n";
    selfLoopCode += RegisteredValuesMap[this.Variables[0]].VariableName + " = " + this.Id + "_buffer[1];\n";
    selfLoopCode += RegisteredValuesMap[this.Variables[0]].VariableName + " = (" + RegisteredValuesMap[this.Variables[0]].VariableName + " << 8) | " + this.Id + "_buffer[0];\n";

	return  new ObjectCode(selfLoopCode + CodeLoop, CodeSetup, selfGlobalCode + CodeGlobal, CodeFunctions);
}

ObjectLegoCompass.prototype.handleNewOutConnection  = function(conn) {
    this.Chain["Next"] = conn.targetId;    
}

ObjectLegoCompass.prototype.handleNewInConnection  = function(conn) {
}

ObjectLegoCompass.prototype.handleDeleteOutConnection  = function(conn) {
    this.Chain["Next"] = null;    
}

ObjectLegoCompass.prototype.handleDeleteInConnection  = function(conn) {
}

ObjectLegoCompass.prototype.Draw  = function(offset, working_area) {
	var body = "";
    
	CreateObjectElement(this, "LegoCompass", offset, working_area);
	if (this.SetupMode == false) { $("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');"); }
	var sourceUUID = this.Id + "_OutConnection_Next";  
    var endpointAnchor = (this.SetupMode == true) ? [[0.98, 0.5, 0, 0], [0.5, 0.98, 0, 0], [0, 0.5, 0, 0], [0.5, 0, 0, 0]] : [0.9, 0.62, 0, 0];
    jsPlumb.addEndpoint(this.Id, ((this.SetupMode == true) ? LegoCompassSetupSourceEndpoint : LegoCompassSourceEndpoint) , { anchor: endpointAnchor, uuid:sourceUUID });
	sourceUUID = this.Id + "_InConnection";
    if (this.SetupMode == false)
    {
        jsPlumb.addEndpoint(this.Id, LegoCompassTargetEndpoint, { anchor:[0.10, 0.62, 0, 0], uuid:sourceUUID });
        
        body += "<div id=\"" + this.Id + "_port_number_div\" style=\"font-family: 'ohw-font'; color: white; position: absolute; top: 25px; right: 13px; width: 25px; text-align:center\">" + this.Port + "</div>";
    }
    else
    {
        body += RemoveButton(this.Id);
    }    
	document.getElementById(this.Id).innerHTML = body;
	return this.Id;
}

ObjectLegoCompass.prototype.AfterDraw = function()
{
    if (this.SetupMode == true) return;
    this.Variables.push(this.Id + "_0");
}

ObjectLegoCompass.prototype.UpdatePort = function UpdatePort(port) {
	this.Port = port;
    $("#"  + this.Id +"_port_number_div").html(this.Port);
	UpdateCode();
}


ObjectLegoCompass.prototype.DrawSettingsPanel  = function() {
	var body = "";

	return body;
}