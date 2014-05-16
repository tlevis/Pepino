var loopTypes = ["while", "for"];
var loopDirection = { INCREASE:1, DECREASE:-1 };

var LoopTargetEndpoint = {
	endpoint: "Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	hoverPaintStyle:connectorHoverStyle,
	maxConnections:1,
	dropOptions:{ hoverClass:"hover", activeClass:"active" },
	isTarget:true,
	overlays:[
		[ "Label", { 
			location:[0.5, -0.3], 
			label:"In",
			cssClass:"LoopEndpointLabel" 
		} ]
	]    
};

var LoopNextEndpoint = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	hoverPaintStyle:connectorHoverStyle,
	connectorHoverStyle:connectorHoverStyle,
	overlays:[
		[ "Label", { 
			location:[1.6, 0.0], 
			label:"Next",
			cssClass:"LoopEndpointLabel" 
		} ]
	]								
};

var LoopEndpoint = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius:12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	hoverPaintStyle:connectorHoverStyle,
	connectorHoverStyle:connectorHoverStyle,
	overlays:[
		[ "Label", { 
			location:[1.75, 0.8], 
			label:"Loop",
			cssClass:"LoopEndpointLabel" 
		} ]
	]				
};	

var LoopConditionEndpoint = {
	endpoint: "Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	hoverPaintStyle:connectorHoverStyle,
	maxConnections:1,
	dropOptions:{ hoverClass:"hover", activeClass:"active" },
	isTarget:true,
    scope: 'logical',
	overlays:[
		[ "Label", { 
			location:[-1.5, 0.3], 
			label:"Condition",
			cssClass:"LoopEndpointLabel" 
		} ]
	]    
};	

function ObjectLoop() {
    this.Chain = {};
    this.ChainIn = {};
	this.Name = "Loop";
    this.Id = this.Name;
	this.Chain["Condition"] = null;
    this.ChainIn["Condition"] = true;
	this.Chain["Loop"] = null;
    this.Chain["Next"] = null;
    
	this.Position = new ObjectPosition();
	this.SetupMode = false;
    this.LoopType = loopTypes[0];
    this.ForMaxValue = 255;
    this.ForMinValue = 0;
    this.ForDirection = loopDirection.INCREASE;
    this.ForStep = 1;
    this.PassedVariables;
}

ObjectLoop.prototype.GetCode = function(passedVars) {
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
    var condition = "";
    var nextCode = "";
		
    var code = "";

    if (this.LoopType == "for")
    {
        var localVariable = this.Id + "_i";
        if (this.PassedVariables.indexOf(localVariable) == -1)
        {
            this.PassedVariables.push(localVariable);    
        }
    }
    
    if (ObjectsMap[this.Id].Chain["Loop"] != null) {
		var obj = ObjectsMap[this.Chain["Loop"]].GetCode(this.PassedVariables);
		CodeGlobal += obj.Global;
        CodeLoop = obj.Loop;
		CodeSetup += obj.Setup;
        CodeFunctions = obj.CodeFunctions;
	}
    
    if (ObjectsMap[this.Id].Chain["Next"] != null) {
		var obj = ObjectsMap[this.Chain["Next"]].GetCode(passedVars);
		CodeGlobal += obj.Global;
        nextCode = obj.Loop;
		CodeSetup += obj.Setup;
        CodeFunctions = obj.CodeFunctions;
	}    

	if (ObjectsMap[this.Id].Chain["Condition"] != null) {
		var obj = ObjectsMap[this.Chain["Condition"]].GetCode();
        condition = obj.CodeMisc;
	}    
    
    if (this.LoopType == "while")
    {
        code += "while (" + condition + ") { " + CodeLoop + " } ";
    }
    else if (this.LoopType == "for")
    {
        var localVariable = this.Id + "_i";
            var startValue = this.ForMinValue;
        var endValue = this.ForMaxValue;
        var operator  = " < ";
        var stepOperator = "+";
        if (this.ForDirection == loopDirection.DECREASE)
        {
            startValue = this.ForMaxValue;
            endValue = this.ForMinValue;
            operator  = " > ";
            stepOperator = "-";
        }

        code += "for (int " + localVariable + " = " + startValue + "; " + localVariable + " " + operator + " " + endValue + "; " + localVariable + " = " + localVariable + (stepOperator + "") + this.ForStep + ") { " + CodeLoop + " } ";    
    }

	return new ObjectCode(code + nextCode, CodeSetup, CodeGlobal, CodeFunctions);
}

ObjectLoop.prototype.handleNewOutConnection  = function(conn) {
    if (conn.sourceEndpoint.getUuid().indexOf("_OutConnection_Loop") != -1) {
        this.Chain["Loop"] = conn.targetId;
    }else if( conn.sourceEndpoint.getUuid().indexOf("_OutConnection_Next") != -1) {
        this.Chain["Next"] = conn.targetId;
    }
}

ObjectLoop.prototype.handleNewInConnection  = function(conn) {
    if (conn.targetEndpoint.getUuid().indexOf("_InConnection_Condition") != -1) {
        this.Chain["Condition"] = conn.sourceId;
    }
}

ObjectLoop.prototype.handleDeleteOutConnection  = function(conn) {
    if (conn.sourceEndpoint.getUuid().indexOf("_OutConnection_Loop") != -1) {
        this.Chain["Loop"] = null;
    }else if( conn.sourceEndpoint.getUuid().indexOf("_OutConnection_Next") != -1) {
        this.Chain["Next"] = null;
    }
}

ObjectLoop.prototype.handleDeleteInConnection  = function(conn) {
}

ObjectLoop.prototype.Draw  = function(offset, working_area) {
	CreateObjectElement(this, "Loop", offset, working_area);
    if (this.SetupMode == false) { $("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');"); }
    
	var sourceUUID = this.Id + "_InConnection";
	jsPlumb.addEndpoint(this.Id, LoopTargetEndpoint, { anchor:[0.5, 0.1, 0, 0], uuid:sourceUUID });

	sourceUUID = this.Id + "_OutConnection_Next";
	jsPlumb.addEndpoint(this.Id, LoopNextEndpoint, { anchor:[0.9, 0.3, 0, 0], uuid:sourceUUID });

	sourceUUID = this.Id + "_OutConnection_Loop";
    jsPlumb.addEndpoint(this.Id, LoopEndpoint, { anchor:[0.83, 0.75, 0, 0], uuid:sourceUUID });

    sourceUUID = this.Id + "_InConnection_Condition";
    jsPlumb.addEndpoint(this.Id, LoopConditionEndpoint, { anchor:[0.32, 0.82, 0, 0], uuid:sourceUUID });
	

	var body = "";
    body = "<div id=\"" + this.Id + "_loop_type\" style=\"font-family: 'ohw-font'; font-size:18px; position: absolute; left: 12px; right: 0px; top: 30px; text-align: center; \">" + this.LoopType + "</div>";
	document.getElementById(this.Id).innerHTML = body;
    console.log(this.Id);
	return this.Id;
}		

ObjectLoop.prototype.DrawSettingsPanel  = function() {
    var body = "";
    body += "<div style='display: inline-block'><b>Loop type:</b>&nbsp;&nbsp;</div>";
    
    body += "<div style='display: inline-block'><select id='" + this.Id + "_source' onchange=\"UpdateLoopType('" + this.Id + "', this.value)\">";
    for (var idx in loopTypes) {
        body += "<option ";
        if (this.LoopType == loopTypes[idx]) body += " selected=\"selected\" ";
		body += "value='" + idx + "'>" + loopTypes[idx] + "</option>";
			
	}
    body += "</select></div>";
    
    if (this.LoopType == loopTypes[1])
    {
        body += "<div style='padding-top: 10px'>";
        body += "   <div style=\"display: inline-block\"><b>Minimum value:</b></div>&nbsp;&nbsp;";
        body += "   <div style=\"display: inline-block\"><input id=\"" + this.Id + "_min_value\" style=\"width: 30px\" type=\"text\" value=\"" + this.ForMinValue + "\" onkeypress=\"return restrictCharacters(this, event, restrictCharactersIntegerOnly); \" /></div>&nbsp;&nbsp;";
        body += "   <div style=\"display: inline-block\"><b>Maximum value:</b></div>";
        body += "   <div style=\"display: inline-block\"><input id=\"" + this.Id + "_max_value\" style=\"width: 30px\" type=\"text\" value=\"" + this.ForMaxValue + "\" onkeypress=\"return restrictCharacters(this, event, restrictCharactersIntegerOnly); \" /></div>&nbsp;&nbsp;";
        body += "   <div style=\"display: inline-block\"><b>Step:</b></div>";
        body += "   <div style=\"display: inline-block\"><input id=\"" + this.Id + "_step_value\" style=\"width: 30px\" type=\"text\" value=\"" + this.ForStep + "\" onkeypress=\"return restrictCharacters(this, event, restrictCharactersIntegerOnly); \" /></div>&nbsp;&nbsp;";
        body += "   <div style=\"display: inline-block\"><b>Operation:</b></div>";
        body += "   <div style=\"display: inline-block\">";
        body += "       <select id=\"" + this.Id + "_direction_value\" onblur=\"UpdateForDirection('" + this.Id + "', this.value);\" onchange=\"UpdateForDirection('" + this.Id + "', this.value);\">";
        for (var idx in loopDirection) {
            body += "<option ";
            if (this.ForDirection == loopDirection[idx]) body += " selected=\"selected\" ";
            var val =  (loopDirection[idx] == -1) ? "Decrease" : "Increase";
            body += "value=\"" + loopDirection[idx] + "\">" + val + "</option>";
        }
        body += "       </select>";
        body += "   </div>";
        body += "</div>";
    }
    
    return body;
}

function UpdateForDirection(id, direction)
{
    ObjectsMap[id].ForDirection = direction;
    UpdateCode();   
}

function UpdateLoopType(id, value)
{
    ObjectsMap[id].LoopType = loopTypes[value];
    $("#" + id + "_loop_type").html(ObjectsMap[id].LoopType);
    ShowSettingsPanel(id, true); 
	UpdateCode();    
}
