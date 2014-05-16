var booleanOperators = [">", "<", "==", "!=", ">=", "<="];

var BooleanSourceEndpoint = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	hoverPaintStyle:connectorHoverStyle,
	connectorHoverStyle:connectorHoverStyle,
    scope: "logical",
	overlays:[
		[ "Label", { 
			location:[0.5, -0.3], 
			label:"Out",
			cssClass:"BooleanEndpointLabel" 
		} ]
	]    
};

var BooleanAEndpoint = {
	endpoint: "Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	hoverPaintStyle:connectorHoverStyle,
	maxConnections:-1,
	dropOptions:{ hoverClass:"hover", activeClass:"active" },
	isTarget:true,
    scope: "logical",
    beforeDrop: function(params) { 
        return (!(params.sourceId == params.targetId));
	},        
	overlays:[
		[ "Label", { 
			location:[0.1, -0.3], 
			label:"A",
			cssClass:"BooleanEndpointLabel" 
		} ]
	]        
};	

var BooleanBEndpoint = {
	endpoint: "Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	hoverPaintStyle:connectorHoverStyle,
	maxConnections:-1,
	dropOptions:{ hoverClass:"hover", activeClass:"active" },
	isTarget:true,
    beforeDrop: function(params) { 
        return (!(params.sourceId == params.targetId));
	},        
    scope: "logical",
	overlays:[
		[ "Label", { 
			location:[0.8, -0.3], 
			label:"B",
			cssClass:"BooleanEndpointLabel" 
		} ]
	]        
};	

function ObjectBoolean() {
    this.Chain = {};
    this.ChainIn = {};
	this.Name = "Boolean";
    this.Id = this.Name;
    this.Chain["A"] = null;
    this.Chain["B"] = null;
    this.ChainIn["A"] = true;
    this.ChainIn["B"] = true;

    this.Operator = "==";
	this.Position = new ObjectPosition();
    this.PassedVariables;    
    
}
ObjectBoolean.prototype.GetCode = function(passedVars) {
    if (typeof passedVars != 'undefined')
    {
        this.PassedVariables = passedVars;
    }
    else
    {
        this.PassedVariables = [];
    }
    
	var variableA = "";
    var variableB = "";

    if (this.Chain["A"] != null) {
		var obj = ObjectsMap[this.Chain["A"]].GetCode(passedVars);
		variableA = obj.CodeMisc;
	}

	if (this.Chain["B"] != null) {
		var obj = ObjectsMap[this.Chain["B"]].GetCode(passedVars);
		variableB = obj.CodeMisc;
	}

	/*
    if (ObjectsMap[this.Id].Chain["A"] != null) {
		var obj = ObjectsMap[this.Chain["A"]].GetCode();
		variableA = obj.CodeMisc;
	}

	if (ObjectsMap[this.Id].Chain["B"] != null) {
		var obj = ObjectsMap[this.Chain["A"]].GetCode();
		variableB = obj.CodeMisc;
	}
    */
    var code = variableA + " " + this.Operator + " " + variableB;
	return new ObjectCode("", "", "", "", code);
}

ObjectBoolean.prototype.handleNewOutConnection  = function(conn) {
 
}

ObjectBoolean.prototype.handleNewInConnection  = function(conn) {
    if (conn.targetEndpoint.getUuid().indexOf("_InConnection_A") != -1) {
        this.Chain["A"] = conn.sourceId;
    }   

    if (conn.targetEndpoint.getUuid().indexOf("_InConnection_B") != -1) {
        this.Chain["B"] = conn.sourceId;
    }  
}

ObjectBoolean.prototype.handleDeleteOutConnection  = function(conn) {
    
}

ObjectBoolean.prototype.handleDeleteInConnection  = function(conn) {
    if (conn.targetEndpoint.getUuid().indexOf("_InConnection_A") != -1) {
        this.Chain["A"] = null;
    }   

    if (conn.targetEndpoint.getUuid().indexOf("_InConnection_B") != -1) {
        this.Chain["B"] = null;
    }   
}

ObjectBoolean.prototype.Draw  = function(offset, working_area) {
	var body = "";   
	CreateObjectElement(this, "Boolean", offset, working_area);
	$("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');");
	var sourceUUID = this.Id + "_OutConnection_Condition";    
	jsPlumb.addEndpoint(this.Id, BooleanSourceEndpoint, { anchor:[0.5, 0.1, 0, 0], uuid:sourceUUID });
	
    sourceUUID = this.Id + "_InConnection_A";    
    jsPlumb.addEndpoint(this.Id, BooleanAEndpoint, { anchor:[0.10, 0.85, 0, 0], uuid:sourceUUID });

    sourceUUID = this.Id + "_InConnection_B";    
    jsPlumb.addEndpoint(this.Id, BooleanBEndpoint, { anchor:[0.9, 0.85, 0, 0], uuid:sourceUUID });
    
    body = "<div  id='" + this.Id + "_operator_div' style=\"font-family: 'ohw-font'; font-size:20px; font-weight: bold; position: absolute; left: 0px; right: 0px; top: 40px; text-align: center; \">" + this.Operator + "</div>";
	$("#" + this.Id).html(body);
	return this.Id;
}				


ObjectBoolean.prototype.DrawSettingsPanel  = function() {
    var body = "<div style='display: inline-block'><b>Operator:</b>&nbsp;&nbsp;</div>";
    body += "<div style='display: inline-block'><select id='"+this.Id+"_operator' onchange=\"UpdateOperator('"+this.Id+"', this.value)\">";
    for (var idx in booleanOperators) {
        body += "<option ";
        if (this.Operator == booleanOperators[idx]) body += " selected=\"selected\" ";
		body += "value='" + idx + "'>" + booleanOperators[idx] + "</option>";
			
	}
	body += "</select></div>";      
    return body;
}

function UpdateOperator(Id, value) {
    ObjectsMap[Id].Operator = booleanOperators[value];
    $("#" + Id + "_operator_div").html(ObjectsMap[Id].Operator);
	UpdateCode();    
}