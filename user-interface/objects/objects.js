
var OutputPortTypes = { DIGITAL:0, PWM: 1};
var PWM_MAX_VALUE = 255;
var PortSignals	= { LOW: 'LOW', HIGH: 'HIGH' };
var PortModes	= { INPUT: 'INPUT', OUTPUT: 'OUTPUT' };

var DefaultWorkingArea = 'working-area';

// ============== General Definitions [START]=============== //
var connectorPaintStyle = {	lineWidth:3, strokeStyle:"#ffc000", joinstyle:"round", outlineColor:"#ffc000", outlineWidth:1 };
var connectorHoverStyle = {	lineWidth:1, strokeStyle:"#41cf0f", outlineColor:"#41cf0f", outlineWidth: 1  };

var MainSourceEndpoint = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#cccccc",radius: 12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	hoverPaintStyle:connectorHoverStyle,
	connectorHoverStyle:connectorHoverStyle								
};

jsPlumb.importDefaults({
	Connector: "Straight", //"Flowchart",
	EndpointStyles : [{ fillStyle:'#225588' }, { fillStyle:'#558822' }],
	Endpoints : [ [ "Dot", {radius:7} ], [ "Dot", { radius:11 } ]],
	ConnectionOverlays : [[ "Arrow", { location:0.6 } ]]
});	


function UpdateCode() {
	var programCode = beautify(ObjectsMap["Main1"].GetCode());
    var includesCode = "";
    // Add the include files
    for (var key in CodeIncludes)
    {
        includesCode += CodeIncludes[key] + "\n";
    }
    
    programCode = includesCode + programCode;
    document.getElementById("txt-program-code").value = programCode;
}

function AddRemoveConnectedObject(conn, remove)
{
    var objId = conn.sourceId;
    if (typeof remove !== 'undefined')  // Remove object
	{
		delete ConnectedObjectsMap[objId];
	}
	else                                // Add object
	{
		ConnectedObjectsMap[objId] = ObjectsOnSetupAreaMap[objId];
        ConnectedObjectsMap[objId].Port = conn.targetEndpoint.getParameter("port");
	}
}

function CreateObjectElement(obj, css, offset, working_area) {
	working_area = typeof working_area !== 'undefined' ? working_area : DefaultWorkingArea;
    if (working_area == "device-setup-area")
    {
        css += "-setup";
    }
	if (disableObjectCounter == false) {
		object_index++;
		obj.Id = obj.Name + object_index;
	}
    else
    {
        //offset.left = parseInt((offset.left + "").replace("px","")) + parseInt($("#framecontentLeft").width()) + "px";
        //offset.top = parseInt((offset.top + "").replace("px","")) + parseInt($("#framecontentTop").height()) + "px";
    }
	var div = $(document.createElement('pepinoObject'));
	$(document.getElementById(working_area)).append(div);
	div.attr('class', css).attr('id', obj.Id);
	div.addClass("multiselectable");
	var workingAreaPosition = $("#" + working_area).offset();
	//div.offset({ top: parseInt((offset.top + "").replace("px","")), left: parseInt((offset.left + "").replace("px",""))}); //+ workingAreaPosition.left
	if (disableObjectCounter == true) 
    {
        $("#" + obj.Id).css({top: offset.top, left: offset.left, position:'absolute'});
    }
    else
    {
        $("#" + obj.Id).css({top: offset.top - workingAreaPosition.top, left: offset.left - workingAreaPosition.left, position:'absolute'});
    }
    obj.Position.X = $("#" + obj.Id).css('left');
	obj.Position.Y = $("#" + obj.Id).css('top');
	jsPlumb.draggable(obj.Id, { 	containment:"parent", 
									drag: function() { 
										if (obj.SetupMode == true) {
                                            ObjectsOnSetupAreaMap[obj.Id].Position.X = $("#" + obj.Id).css('left');
											ObjectsOnSetupAreaMap[obj.Id].Position.Y = $("#" + obj.Id).css('top');
										}else{
											ObjectsMap[obj.Id].Position.X = $("#" + obj.Id).css('left');
											ObjectsMap[obj.Id].Position.Y = $("#" + obj.Id).css('top');
										}
									} });										
}

function ConnectionObject(area, source, target)
{
    this.Area = area;
    this.Source = source;
    this.Target = target;
}

function ObjectCode (loopPart, setupPart, globalPart, functionsPart, miscPart) {
	this.Loop           = loopPart;
	this.Setup          = (typeof setupPart !== 'undefined') ? setupPart : "";
    this.Global         = (typeof globalPart !== 'undefined') ? globalPart : "";
    this.CodeFunctions  = (typeof functionsPart !== 'undefined') ? functionsPart : "";
    this.CodeMisc       = (typeof miscPart !== 'undefined') ? miscPart : "";
}

function ObjectRegisteredValue(id, description, variableName, valueType)
{
    this.ObjectId = id;
    this.FriendlyName = description;
    this.VariableName = id + variableName;
    this.ValueType = (typeof valueType !== 'undefined') ? valueType : "int";
}

function ObjectPosition() {
	this.X = "0px";
	this.Y = "0px";
}

function RemoveButton(Id, css) {
	return"<div class='RemoveObjectClass'><img src='images/Close.png' alt='Remove' title='Remove' onclick=\"RemoveObject('"+Id+"');\" /></div>";
}

function RemoveObject(Id) {
	jsPlumb.removeAllEndpoints(Id);
	delete ObjectsMap[Id];
    delete ConnectedObjectsMap[Id];
	var child = document.getElementById(Id);
	child.parentNode.removeChild(child);
	ChangePanel(false);
    UpdateToolBox();
}

function ShowSettingsPanel(Id, override) {
    if (active_object_settings != Id || (typeof override !== 'undefined')) {
		$("#object-name").text(ObjectsMap[Id].Name);
        $("#PropertiesPanelContent").html(ObjectsMap[Id].DrawSettingsPanel());
		if (active_object_settings != "")
        {
             $("#" + active_object_settings).unbind("mousemove");
        }
        active_object_settings = Id;
		ChangePanel(true);        
	}
}

// ================ MAIN PROGRAM ================ //

function ObjectMain() {
    this.Chain = {};
	this.Name = "Main";
    this.Id = this.Name;
	this.Chain["Next"] = null;
	this.Position = new ObjectPosition();
	this.SetupMode = false;
}

ObjectMain.prototype.handleNewOutConnection  = function(conn) {
    this.Chain["Next"] = conn.targetId;
}

ObjectMain.prototype.handleNewInConnection  = function(conn) {
}

ObjectMain.prototype.handleDeleteOutConnection  = function(conn) {
    this.Chain["Next"] = null;
}

ObjectMain.prototype.handleDeleteInConnection  = function(conn) {
}


ObjectMain.prototype.Draw  = function(offset) {
	CreateObjectElement(this, "Main", offset);
	var sourceUUID = this.Id + "_OutConnection_Next";
	jsPlumb.addEndpoint(this.Id, MainSourceEndpoint, { anchor:[
															[0.9, 0.5, 0, 0],[0.5, 0.92, 0, 0],[0.5, 0.1, 0, 0],[0.05, 0.5, 0, 0]
															], uuid:sourceUUID });
	return this.Id;
}
ObjectMain.prototype.GetCode = function() {
	var programCode = "";
    var CodeLoop = "";
	var CodeSetup = "";
    var CodeGlobal = "";
    var CodeFunctions = "";
	var obj = null;
	
	Ports = []; // Delete the ports array
	
	if (ObjectsMap[this.Id].Chain["Next"] != null) {
		var obj = ObjectsMap[this.Chain["Next"]].GetCode();
		
		CodeLoop = obj.Loop;
		CodeSetup = obj.Setup;
        CodeGlobal = obj.Global;
        CodeFunctions = obj.CodeFunctions;
	}
    
    // Add the include files
    for (var key in CodeLibraryFunctions)
    {
        programCode += CodeLibraryFunctions[key] + "\n";
    }        

    programCode += CodeGlobal + "\n";
    programCode += CodeFunctions + "\n";
    programCode += "\n void setup() { \n";

    for (var key in CodeSetupInitialize)
    {
        programCode += CodeSetupInitialize[key] + "\n";
    }        

    programCode += CodeSetup + " } \n";

    programCode += "\n void loop() { " + CodeLoop + " }";

	return  programCode;
}
