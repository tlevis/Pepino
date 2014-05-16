var LegoTiltSetupSourceEndpoint = {
	endpoint:"Rectangle",
	paintStyle:{ fillStyle:"#bbbdb8", width: 25, height: 25 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	connectorHoverStyle:connectorHoverStyle,
    scope: 'lego'
};

var LegoTiltSourceEndpoint = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	connectorHoverStyle:connectorHoverStyle,
	overlays:[
		[ "Label", { 
			location:[1.6, 0.5], 
			label:"Next",
			cssClass:"LegoTiltEndpointLabel" 
		} ]
	]      
};

var LegoTiltTargetEndpoint = {
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
			cssClass:"LegoTiltEndpointLabel" 
		} ]
	]     
};	
			
function ObjectLegoTilt(port) {
    this.Chain = {};
	this.Name = "LegoTilt";
    this.Id = this.Name;
    this.Category = "Lego";
	this.Port = (port == undefined) ? "L1" : port ;
	this.Chain["Next"] = null;
	this.Position = new ObjectPosition();
	this.SetupMode = false;
    this.Variables = [];
    this.PassedVariables;
}

ObjectLegoTilt.prototype.GetCode = function(passedVars) {
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
            RegisteredValuesMap[this.Variables[0]] = new ObjectRegisteredValue(this.Id, ' lego accelerometer x','_X');

        if (typeof RegisteredValuesMap[this.Variables[1]] == 'undefined')
            RegisteredValuesMap[this.Variables[1]] = new ObjectRegisteredValue(this.Id, ' lego accelerometer y','_Y');
        
        if (typeof RegisteredValuesMap[this.Variables[2]] == 'undefined')
            RegisteredValuesMap[this.Variables[2]] = new ObjectRegisteredValue(this.Id, ' lego accelerometer z','_Z');

            
    }
	
	var selfGlobalCode = "int " + RegisteredValuesMap[this.Variables[0]].VariableName + " = 0;\n";
    selfGlobalCode += "int " + RegisteredValuesMap[this.Variables[1]].VariableName + " = 0;\n";
    selfGlobalCode += "int " + RegisteredValuesMap[this.Variables[2]].VariableName + " = 0;\n";
    

    var selfLoopCode = "byte " + this.Id + "_buffer[1];\n";
    // X
    selfLoopCode += "readFrom(0x02, 0x42, " + this.Id + "_buffer, 1);\n";
    selfLoopCode += RegisteredValuesMap[this.Variables[0]].VariableName + " = " + this.Id + "_buffer[0];\n";
    // Y
    selfLoopCode += "readFrom(0x02, 0x43, " + this.Id + "_buffer, 1);\n";
    selfLoopCode += RegisteredValuesMap[this.Variables[1]].VariableName + " = " + this.Id + "_buffer[0];\n";
    // Z
    selfLoopCode += "readFrom(0x02, 0x44, " + this.Id + "_buffer, 1);\n";
    selfLoopCode += RegisteredValuesMap[this.Variables[2]].VariableName + " = " + this.Id + "_buffer[0];\n";
    

	return  new ObjectCode(selfLoopCode + CodeLoop, CodeSetup, selfGlobalCode + CodeGlobal, CodeFunctions);
}

ObjectLegoTilt.prototype.handleNewOutConnection  = function(conn) {
    this.Chain["Next"] = conn.targetId;    
}

ObjectLegoTilt.prototype.handleNewInConnection  = function(conn) {
}

ObjectLegoTilt.prototype.handleDeleteOutConnection  = function(conn) {
    this.Chain["Next"] = null;    
}

ObjectLegoTilt.prototype.handleDeleteInConnection  = function(conn) {
    var i2c = getI2C();
    delete CodeIncludes[i2c.Name];
    delete CodeLibraryFunctions[i2c.Name];
    delete CodeSetupInitialize[i2c.Name];
}

ObjectLegoTilt.prototype.Draw  = function(offset, working_area) {
	var body = "";
    
	CreateObjectElement(this, "LegoTilt", offset, working_area);
	if (this.SetupMode == false) { $("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');"); }
	var sourceUUID = this.Id + "_OutConnection_Next";  
    var endpointAnchor = (this.SetupMode == true) ? [[0.98, 0.5, 0, 0], [0.5, 0.98, 0, 0], [0, 0.5, 0, 0], [0.5, 0, 0, 0]] : [0.9, 0.62, 0, 0];
    jsPlumb.addEndpoint(this.Id, ((this.SetupMode == true) ? LegoTiltSetupSourceEndpoint : LegoTiltSourceEndpoint) , { anchor: endpointAnchor, uuid:sourceUUID });
	sourceUUID = this.Id + "_InConnection";
    if (this.SetupMode == false)
    {
        jsPlumb.addEndpoint(this.Id, LegoTiltTargetEndpoint, { anchor:[0.10, 0.62, 0, 0], uuid:sourceUUID });
        
        body += "<div id=\"" + this.Id + "_port_number_div\" style=\"font-family: 'ohw-font'; color: white; position: absolute; top: 25px; right: 13px; width: 25px; text-align:center\">" + this.Port + "</div>";
    }
    else
    {
        body += RemoveButton(this.Id);
    }    
	document.getElementById(this.Id).innerHTML = body;
	return this.Id;
}

ObjectLegoTilt.prototype.AfterDraw = function()
{
    if (this.SetupMode == true) return;
    for (var i = 0; i < 3; i++)
    {
        this.Variables.push(this.Id + "_" + i);
    }
}

ObjectLegoTilt.prototype.UpdatePort = function UpdatePort(port) {
	this.Port = port;
    $("#"  + this.Id +"_port_number_div").html(this.Port);
	UpdateCode();
}


ObjectLegoTilt.prototype.DrawSettingsPanel  = function() {
	var body = "";

	return body;
}