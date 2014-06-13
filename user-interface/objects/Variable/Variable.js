var variableSources = ["Number", "Boolean", "String", "Global Variable", "Branch Variable"];

var VariableSourceEndpoint = {
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
			cssClass:"VariableEndpointLabel" 
		} ]
	]    
};

function ObjectVariable() {
    this.Chain = {};
	this.Name = "Variable";
    this.Id = this.Name;
	this.Source = "0";
    this.Values = ["0", "true", "", "", ""];
	this.Position = new ObjectPosition();
    this.PassedVariables;
}

ObjectVariable.prototype.GetCode = function(passedVars) {
    if (typeof passedVars != 'undefined')
    {
        this.PassedVariables = passedVars;
    }
    else
    {
        this.PassedVariables = [];
    }
		/*
	if (ObjectsMap[this.Id].Next != null) {
		var obj = ObjectsMap[this.TruePart].GetCode();
		CodeGlobal = obj.Global;
        CodeLoop += obj.Loop;
		CodeSetup += obj.Setup;
        CodeFunctions = obj.CodeFunctions;
	}
	*/
    var code = this.Values[this.Source];
	return new ObjectCode("", "", "", "", code);
}

ObjectVariable.prototype.handleNewOutConnection  = function(conn) {
    
}

ObjectVariable.prototype.handleNewInConnection  = function(conn) {

}

ObjectVariable.prototype.handleDeleteOutConnection  = function(conn) {
    
}

ObjectVariable.prototype.handleDeleteInConnection  = function(conn) {

}

ObjectVariable.prototype.Draw  = function(offset, working_area) {
	var body = "";   
	CreateObjectElement(this, "Variable", offset, working_area);
	$("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');");
	var sourceUUID = this.Id + "_OutConnection_Out";
	jsPlumb.addEndpoint(this.Id, VariableSourceEndpoint, { anchor:[0.5, 0.1, 0, 0], uuid:sourceUUID });

	$("#" + this.Id).html(body);
	return this.Id;
}				


ObjectVariable.prototype.DrawSettingsPanel  = function() {
    var body = "";
    body += "<div style='display: inline-block'><b>Source:</b>&nbsp;&nbsp;</div>";
    
    body += "<div style='display: inline-block'><select id='" + this.Id + "_source' onchange=\"VariableUpdateSource('" + this.Id + "', this.value)\">";
    for (var idx in variableSources) {
        body += "<option ";
        if (this.Source == idx) body += " selected=\"selected\" ";
		body += "value='" + idx + "'>" + variableSources[idx] + "</option>";
			
	}
    body += "</select></div>&nbsp;&nbsp;<div style='display: inline-block' id=\"" + this.Id + "_source_div\">" + GetValueField(this.Id, this.Source) + "</div>";     
    
    return body;
}

function GetValueField(Id, source) 
{
    var html = "";
    source += "";    // Make it string
    switch (source)
    {
        case "0":
        case "2":
        {
            // Number & String
            html += "<input type=\"text\" id=\"" + Id +"_value\" value=\"" + ObjectsMap[Id].Values[source] + "\" ";
            if (source == "0")
                html += " onkeypress=\"return restrictCharacters(this, event, restrictCharactersIntegerOnly); \"";
            html += " onblur=\"VariableUpdateValue('" + Id + "', " + source + ", this.value)\" style='width: 50px' />";
        }
        break;
        case "1":
        {
            html += "<select id='" + Id + "_value' onblur=\"VariableUpdateValue('" + Id + "', " + source + ", this.value)\">";
            html += "<option ";
            if (ObjectsMap[Id].Values[source] == "true") html += " selected=\"selected\" ";
            html += "value='true'>True</option>";
            html += "<option ";
            if (ObjectsMap[Id].Values[source] == "false") html += " selected=\"selected\" ";
            html += "value='false'>False</option>";
            html += "</select>";        
        }
        break;        
        case "3":
        {
            html += "<select id='" + Id + "_value' onblur=\"VariableUpdateValue('" + Id + "', " + source + ", this.value)\">";
            for (var objId in RegisteredValuesMap) {
                html += "<option ";
                if (ObjectsMap[Id].Values[source] == RegisteredValuesMap[objId].VariableName) html += " selected=\"selected\" ";
                html += "value='" + RegisteredValuesMap[objId].VariableName + "'>" + RegisteredValuesMap[objId].ObjectId + RegisteredValuesMap[objId].FriendlyName + "</option>";
            }
            html += "</select>&nbsp;<span style='cursor: pointer' onclick=\"whoIsIt(" + Id + "_value.value);\">Who is it?</span>";        
        }
        break;
        case "4":        
        {
            html += "<select id='" + Id + "_value' onblur=\"VariableUpdateValue('" + Id + "', " + source + ", this.value)\">";
            for (var objId in ObjectsMap[Id].PassedVariables) {
                html += "<option ";
                if (ObjectsMap[Id].Values[source] == ObjectsMap[Id].PassedVariables[objId]) html += " selected=\"selected\" ";
                html += "value='" + ObjectsMap[Id].PassedVariables[objId] + "'>" + ObjectsMap[Id].PassedVariables[objId] + "</option>";
            }
            html += "</select>&nbsp;<span style='cursor: pointer' onclick=\"whoIsIt(" + Id + "_value.value);\">Who is it?</span>";        
        }        
        break;
    }
    return html;
}

function VariableUpdateSource(Id, source) {
    ObjectsMap[Id].Source = source;
    var html = GetValueField(Id, source);
    $("#" + Id + "_source_div").html(html);
	UpdateCode();
}

function VariableUpdateValue(Id, source, value) {
    console.log(value);
    ObjectsMap[Id].Values[source] = value;
    UpdateCode();    
}