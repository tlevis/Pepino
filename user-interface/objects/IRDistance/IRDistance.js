var IRDistanceUnits = {"cm": "Centemeters", "inch": "Inches" }
var IRDistanceSetupSourceEndpoint = {
	endpoint:"Rectangle",
	paintStyle:{ fillStyle:"#ebb600", width: 25, height: 25 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	connectorHoverStyle:connectorHoverStyle,
    scope: 'analog'
};

var IRDistanceSourceEndpoint = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	connectorHoverStyle:connectorHoverStyle,
	overlays:[
		[ "Label", { 
			location:[1.6, 0.5], 
			label:"Next",
			cssClass:"IRDistanceEndpointLabel" 
		} ]
	]      
};

var IRDistanceTargetEndpoint = {
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
			cssClass:"IRDistanceEndpointLabel" 
		} ]
	]     
};	
			
function ObjectIRDistance (port) {
    this.Chain = {};
	this.Name = "IRDistance";
    this.Id = this.Name;
    this.Category = "Analog";
	this.Port = (port == undefined) ? "A0" : port ;
	this.Chain["Next"] = null;
    this.Unit = "cm";
	this.Position = new ObjectPosition();
	this.SetupMode = false;
    this.Variables = [];
    this.PassedVariables;
    this.MinValue = 10;
    this.MaxValue = 80;
}

ObjectIRDistance.prototype.GetCode = function(passedVars) {
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
    
    var valueDivider = "";
    if (this.Unit == "inch") 
    {
        valueDivider = "/2.54";
    }
	var selfLoopCode = RegisteredValuesMap[this.Variables[0]].VariableName + " = (4800/(analogRead(" + this.Port + ") - 20))" + valueDivider + ";";

	return  new ObjectCode(selfLoopCode + CodeLoop, CodeSetup, selfGlobalCode + CodeGlobal, CodeFunctions);
}

ObjectIRDistance.prototype.handleNewOutConnection  = function(conn) {
    this.Chain["Next"] = conn.targetId;    
}

ObjectIRDistance.prototype.handleNewInConnection  = function(conn) {
}

ObjectIRDistance.prototype.handleDeleteOutConnection  = function(conn) {
    this.Chain["Next"] = null;    
}

ObjectIRDistance.prototype.handleDeleteInConnection  = function(conn) {
}

ObjectIRDistance.prototype.Draw  = function(offset, working_area) {
	var body = "";
    
	CreateObjectElement(this, "IRDistance", offset, working_area);
	if (this.SetupMode == false) { $("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');"); }
	var sourceUUID = this.Id + "_OutConnection_Next";  
    var endpointAnchor = (this.SetupMode == true) ? [[0.98, 0.5, 0, 0], [0.5, 0.98, 0, 0], [0.05, 0.5, 0, 0], [0.5, 0, 0, 0]] : [0.9, 0.62, 0, 0];
    jsPlumb.addEndpoint(this.Id, ((this.SetupMode == true) ? IRDistanceSetupSourceEndpoint : IRDistanceSourceEndpoint) , { anchor: endpointAnchor, uuid:sourceUUID });
	sourceUUID = this.Id + "_InConnection";
    if (this.SetupMode == false)
    {
        jsPlumb.addEndpoint(this.Id, IRDistanceTargetEndpoint, { anchor:[0.10, 0.62, 0, 0], uuid:sourceUUID });
        
        body += "<div id=\"" + this.Id + "_port_number_div\" style=\"font-family: 'ohw-font'; color: white; position: absolute; top: 25px; right: 13px; width: 25px; text-align:center\">" + this.Port + "</div>";
        body += "<div align='center' style=\"position: absolute; top: 60px; left: 0; right:0\"><b>Units:</b><div id=\"" + this.Id + "-unit-name\" style=\"font-size: 10px\">" + IRDistanceUnits[this.Unit] + "</div></div>";
    }
    else
    {
        body += RemoveButton(this.Id);
    }    
	document.getElementById(this.Id).innerHTML = body;
	return this.Id;
}

ObjectIRDistance.prototype.AfterDraw = function()
{
    if (this.SetupMode == true) return;
    this.Variables.push(this.Id + "_0");
}

ObjectIRDistance.prototype.UpdatePort = function UpdatePort(port) {
	this.Port = port;
    $("#"  + this.Id +"_port_number_div").html(this.Port);
	UpdateCode();
}


ObjectIRDistance.prototype.DrawSettingsPanel  = function() {
	var min = this.MinValue;
    var max = this.MaxValue;
    var body = "";
    body += "<div style=\"line-height: 30px; vertical-align: middle\"><b>Units:</b> <input type=\"radio\" id=\"" + this.Id + "_output_units\" name=\"" + this.Id + "_output_units\" value=\"cm\" onclick=\"IRDistanceUnitChanged('"+this.Id+"', this.value);\" "; 
    if (this.Unit == "cm") 
    {
        body += " checked "; 
    }
    body += "/> Centimeters ";
    body += "&nbsp;&nbsp;&nbsp;&nbsp;<input type=\"radio\" id=\"" + this.Id + "_output_units\" name=\"" + this.Id + "_output_units\" value=\"inch\" onclick=\"IRDistanceUnitChanged('"+this.Id+"', this.value);\" ";
    
    if (this.Unit == "inch") 
    {	
        body += " checked "; 
        min = (min / 2.54).toPrecision(2);
        max = (max / 2.54).toPrecision(2);
    }
    body += "/> Inches </div>";
    body += "<div><b>Value range:</b> " + min + " - " + max  + "</div>";
	return body;
}


function IRDistanceUnitChanged(Id, value) {
	ObjectsMap[Id].Unit = value;
    $("#" + Id + "-unit-name").text(IRDistanceUnits[value]);    
    ShowSettingsPanel(Id, true);
	UpdateCode();
}