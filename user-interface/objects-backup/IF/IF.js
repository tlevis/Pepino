var IFsourceEndpointTrue = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	hoverPaintStyle:connectorHoverStyle,
	connectorHoverStyle:connectorHoverStyle,
	overlays:[
		[ "Label", { 
			location:[1.8, 0.5], 
			label:"True",
			cssClass:"IFendpointLabel" 
		} ]
	]								
};

var IFsourceEndpointFalse = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius:12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	hoverPaintStyle:connectorHoverStyle,
	connectorHoverStyle:connectorHoverStyle,
	overlays:[
		[ "Label", { 
			location:[-0.8, 0.5], 
			label:"False",
			cssClass:"IFendpointLabel" 
		} ]
	]				
};	

var IFNextEndpoint = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	hoverPaintStyle:connectorHoverStyle,
	connectorHoverStyle:connectorHoverStyle,
	overlays:[
		[ "Label", { 
			location:[0.5, -0.3], 
			label:"Next",
			cssClass:"IFendpointLabel" 
		} ]
	]
};

var IFtargetEndpoint = {
	endpoint: "Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	hoverPaintStyle:connectorHoverStyle,
	maxConnections:1,
	dropOptions:{ hoverClass:"hover", activeClass:"active" },
	isTarget:true,
    beforeDrop: function(params) { 
        return (!(params.sourceId == params.targetId));
	},    
	overlays:[
		[ "Label", { 
			location:[0.5, -0.3], 
			label:"In",
			cssClass:"IFendpointLabel" 
		} ]
	]    
};

var IFConditionEndpoint = {
	endpoint: "Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	hoverPaintStyle:connectorHoverStyle,
	maxConnections:1,
	dropOptions:{ hoverClass:"hover", activeClass:"active" },
	isTarget:true,
    scope: 'logical',
	overlays:[
		[ "Label", { 
			location:[0.5, 1.3], 
			label:"Condition",
			cssClass:"IFendpointLabel" 
		} ]
	]    
};	

function ObjectIF(condition) {
    this.Chain = {};
    this.ChainIn = {};
	this.Name = "IF";
    this.Id = this.Name;
	this.Chain["Condition"] = condition;
    this.ChainIn["Condition"] = true;
	this.Chain["TruePart"] = null;
	this.Chain["FalsePart"] = null;
    this.Chain["Next"] = null;
    
	this.Position = new ObjectPosition();
	this.SetupMode = false;
    this.PassedVariables;
}
ObjectIF.prototype.GetCode = function(passedVars) {
    if (typeof passedVars != 'undefined')
    {
        this.PassedVariables = passedVars;
    }
    else
    {
        this.PassedVariables = [];
    }
    
	var CodeGlobal = "";
    var CodeTrue = "";
	var CodeFalse = "";
	var CodeSetup = "";
    var CodeFunctions = "";
	var obj = null;
    var condition = "";
    var nextCode = "";
		
	if (this.Chain["Next"] != null) {
		var obj = ObjectsMap[this.Chain["Next"]].GetCode(passedVars);
		CodeGlobal += obj.Global;
        nextCode = obj.Loop;
		CodeSetup += obj.Setup;
        CodeFunctions = obj.CodeFunctions;
	}    
    if (this.Chain["TruePart"] != null) {
		var obj = ObjectsMap[this.Chain["TruePart"]].GetCode(passedVars);
		CodeGlobal += obj.Global;
        CodeTrue = obj.Loop;
		CodeSetup += obj.Setup;
        CodeFunctions = obj.CodeFunctions;
	}
	if (this.Chain["FalsePart"] != null) {
		var obj = ObjectsMap[this.Chain["FalsePart"]].GetCode(passedVars);
		CodeGlobal += obj.Global;
        CodeFalse = obj.Loop;
		CodeSetup += obj.Setup;
        CodeFunctions = obj.CodeFunctions;        
	}
	if (this.Chain["Condition"] != null) {
		var obj = ObjectsMap[this.Chain["Condition"]].GetCode(passedVars);
        condition = obj.CodeMisc;
	}    

        
    var code = "if (" + condition + ") { " + CodeTrue + " } ";
	if (CodeFalse != "") code += "else { " + CodeFalse + " }";
	return new ObjectCode(code + nextCode, CodeSetup, CodeGlobal, CodeFunctions);
}

ObjectIF.prototype.handleNewOutConnection  = function(conn) {   
    if (conn.sourceEndpoint.getUuid().indexOf("_OutConnection_TruePart") != -1) {
        this.Chain["TruePart"] = conn.targetId;
    }else if( conn.sourceEndpoint.getUuid().indexOf("_OutConnection_FalsePart") != -1) {
        this.Chain["FalsePart"] = conn.targetId;
    }else if( conn.sourceEndpoint.getUuid().indexOf("_OutConnection_Next") != -1) {
        this.Chain["Next"] = conn.targetId;
    }
}

ObjectIF.prototype.handleNewInConnection  = function(conn) {
    if (conn.targetEndpoint.getUuid().indexOf("_InConnection_Condition") != -1) {
        this.Chain["Condition"] = conn.sourceId;
    }
}

ObjectIF.prototype.handleDeleteOutConnection  = function(conn) {
    if (conn.sourceEndpoint.getUuid().indexOf("_OutConnection_TruePart") != -1) {
        this.Chain["TruePart"] = null;
    }else if( conn.sourceEndpoint.getUuid().indexOf("_OutConnection_FalsePart") != -1) {
        this.Chain["FalsePart"] = null;
    }else if( conn.sourceEndpoint.getUuid().indexOf("_OutConnection_Next") != -1) {
        this.Chain["Next"] = null;
    }
}

ObjectIF.prototype.handleDeleteInConnection  = function(conn) {
    if (conn.targetEndpoint.getUuid().indexOf("_InConnection_Condition") != -1) {
        this.Chain["Condition"] = null;
    }
}

ObjectIF.prototype.Draw  = function(offset, working_area) {
	CreateObjectElement(this, "IF", offset, working_area);
    if (this.SetupMode == false) { $("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');"); }
    
	var sourceUUID = this.Id + "_OutConnection_TruePart";
    jsPlumb.addEndpoint(this.Id, IFsourceEndpointTrue, { anchor:[0.9, 0.60, 0, 0], uuid:sourceUUID });

	sourceUUID = this.Id + "_OutConnection_FalsePart";
	jsPlumb.addEndpoint(this.Id, IFsourceEndpointFalse, { anchor:[0.1, 0.6, 0, 0], uuid:sourceUUID });

    sourceUUID = this.Id + "_InConnection_Condition";
    jsPlumb.addEndpoint(this.Id, IFConditionEndpoint, { anchor:[0.5, 0.9, 0, 0], uuid:sourceUUID });
	
	sourceUUID = this.Id + "_InConnection";
	jsPlumb.addEndpoint(this.Id, IFtargetEndpoint, { anchor:[0.25, 0.13, 0, 0], uuid:sourceUUID });
	
	sourceUUID = this.Id + "_OutConnection_Next";
	jsPlumb.addEndpoint(this.Id, IFNextEndpoint, { anchor:[0.75, 0.13, 0, 0], uuid:sourceUUID });

	//document.getElementById(this.Id).innerHTML = this.Id;
	var body = "";
    body = "<div style=\"font-family: 'ohw-font'; font-size:24px; position: absolute; left: 35px; top : 22px; \">if</div>";
	document.getElementById(this.Id).innerHTML = body;	
	return this.Id;
}		

ObjectIF.prototype.DrawSettingsPanel  = function() {
    return "";
}		
