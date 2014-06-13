var ScaledVariableVariableSources = ["Branch Variable", "Global Variable"];

var ScaledVariableSourceEndpoint = {
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
			cssClass:"ScaledVariableEndpointLabel" 
		} ]
	]    
};
var ScaledVariableTargetEndpoint = {
	endpoint: "Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	hoverPaintStyle:connectorHoverStyle,
	maxConnections:-1,
	dropOptions:{ hoverClass:"hover", activeClass:"active" },
	isTarget:true,
	overlays:[
		[ "Label", { 
			location:[-0.4, 0.5], 
			label:"In",
			cssClass:"ScaledVariableEndpointLabel" 
		} ]
	]    
};	

function ObjectScaledVariable() {
    this.Chain = {};
	this.Name = "ScaledVariable";
    this.Id = this.Name;
    this.Category = "Functional";
	this.Chain["Next"] = null;
	this.Position = new ObjectPosition();
	this.SetupMode = false;
    this.InVariableSource = 0;
    this.InVariable = ["",""];
    this.InMin = 0;
    this.InMax = 1023;
    this.OutMin = 0;
    this.OutMax = 255;
    this.PassedVariables;
}

ObjectScaledVariable.prototype.GetCode = function(passedVars) {
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
    
    var localVariable = this.Id + "_scaled";
    if (this.PassedVariables.indexOf(localVariable) == -1)
    {
        this.PassedVariables.push(localVariable);    
    }    
		
	if (ObjectsMap[this.Id].Chain["Next"] != null) {
		var obj = ObjectsMap[this.Chain["Next"]].GetCode(this.PassedVariables);
		CodeGlobal = obj.Global;
        CodeLoop = obj.Loop;
		CodeSetup = obj.Setup;
        CodeFunctions = obj.CodeFunctions;
	}
    var code = "int " + localVariable + " = map(" + this.InVariable[this.InVariableSource] + "," + this.InMin + "," + this.InMax + "," + this.OutMin + "," + this.OutMax + ");";
    return new ObjectCode(code + CodeLoop, CodeSetup, CodeGlobal, CodeFunctions);
}

ObjectScaledVariable.prototype.handleNewOutConnection  = function(conn) {
    this.Chain["Next"] = conn.targetId;    
}

ObjectScaledVariable.prototype.handleNewInConnection  = function(conn) {
}

ObjectScaledVariable.prototype.handleDeleteOutConnection  = function(conn) {
    this.Chain["Next"] = null;    
}

ObjectScaledVariable.prototype.handleDeleteInConnection  = function(conn) {

}

ObjectScaledVariable.prototype.Draw = function(offset, working_area) {
		CreateObjectElement(this, "ScaledVariable", offset, working_area);
		$("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');");	
		var sourceUUID = this.Id + "_OutConnection_Next";
		jsPlumb.addEndpoint(this.Id, DelaysourceEndpoint, { anchor:[0.9, 0.56, 0, 0], uuid:sourceUUID });
		sourceUUID = this.Id + "_InConnection";
		jsPlumb.addEndpoint(this.Id, DelaytargetEndpoint, { anchor:[0.1, 0.56, 0, 0], uuid:sourceUUID });

        var body = "<div style=\"position: absolute; top: 35px; left: 0px; right: 0px; width:100%; text-align:center; font-size: 10px\" >"; 
		body += "<div>from</div>";
        body += "<div id='"+this.Id+"_in_text_value'>" + this.InMin + " ... " + this.InMax + "</div>";
        body += "<div>to</div>";
        body += "<div id='"+this.Id+"_out_text_value'>" + this.OutMin + " ... " + this.OutMax + "</div>";
		body += "</div>";
		document.getElementById(this.Id).innerHTML = body;
		return this.Id;
}

ObjectScaledVariable.prototype.DrawSettingsPanel  = function() {
		var body = "";
        
        body += "<div id=\"" + this.Id +"_range_div\" style='padding-bottom: 10px'>";
        body += "   <div><b>Minimum input:</b> ";
        body += "<input type=\"text\" id=\"" + this.Id +"_in_min_value\" value=\"" + this.InMin + "\" onkeypress=\"return restrictCharacters(this, event, restrictCharactersIntegerOnly); \" onblur=\"scaledVariableUpdateValue('" + this.Id + "', 'InMin', this.value)\" style='width: 30px' />, ";
        body += "   <b>Maximum input:</b> ";
        body += "<input type=\"text\" id=\"" + this.Id +"_in_max_value\" value=\"" + this.InMax + "\" onkeypress=\"return restrictCharacters(this, event, restrictCharactersIntegerOnly); \" onblur=\"scaledVariableUpdateValue('" + this.Id + "', 'InMax', this.value)\" style='width: 30px' />, ";
        body += "   <b>Minimum output:</b> ";
        body += "<input type=\"text\" id=\"" + this.Id +"_out_min_value\" value=\"" + this.OutMin + "\" onkeypress=\"return restrictCharacters(this, event, restrictCharactersIntegerOnly); \" onblur=\"scaledVariableUpdateValue('" + this.Id + "', 'OutMin', this.value)\" style='width: 30px' />, ";
        body += "   <b>Maximum output:</b> ";
        body += "<input type=\"text\" id=\"" + this.Id +"_out_max_value\" value=\"" + this.OutMax + "\" onkeypress=\"return restrictCharacters(this, event, restrictCharactersIntegerOnly); \" onblur=\"scaledVariableUpdateValue('" + this.Id + "', 'OutMax', this.value)\" style='width: 30px' /> ";
        body += "   </div>";
        body += "</div>";
        
        
        body += "<div id=\"" + this.Id +"_value_div\">";
        body += "   <div style=\"display: inline-block\"><b>Input variable:</b></div>";
        body += "   <div style=\"display: inline-block\">";
        body += "       <select id=\"" + this.Id + "_variable_value_source\" onchange=\"scaledVariableUpdateVariableSource('" + this.Id + "', this.value);\">";
        for (var idx in ScaledVariableVariableSources) {
            idx = idx + "";
            body += "<option ";
            if (this.InVariableSource == idx) body += " selected=\"selected\" ";
            body += "value='" + idx + "'>" + ScaledVariableVariableSources[idx] + "</option>";
                
        }
        body += "       </select>";
        body += "   </div>";
        
        if (this.InVariableSource == "0")
        {        
            body += "       <select id=\"" + this.Id + "_variable\" onblur=\"scaledVariableUpdateVariable('" + this.Id + "', 0, this.value)\" onchange=\"scaledVariableUpdateVariable('" + this.Id + "', 0, this.value)\">";
            for (var idx in this.PassedVariables) {
                if ( this.PassedVariables[idx] != (this.Id + "_scaled") )
                {
                    body += "<option ";
                    if (this.InVariable[0] == this.PassedVariables[idx]) body += " selected=\"selected\" ";
                    body += "value='" + idx + "'>" + this.PassedVariables[idx] + "</option>";
                }
            }
            body += "       </select>";
        }        
        
        if (this.InVariableSource == "1")
        {
            body += "<select id='" + this.Id + "_variable' onblur=\"scaledVariableUpdateVariable('" + this.Id + "',1, this.value)\" onchange=\"scaledVariableUpdateVariable('" + this.Id + "',1, this.value)\">";
            for (var objId in RegisteredValuesMap) {
                body += "<option ";
                if (this.InVariable[1] == RegisteredValuesMap[objId].VariableName) body += " selected=\"selected\" ";
                body += "value='" + RegisteredValuesMap[objId].VariableName + "'>" + RegisteredValuesMap[objId].ObjectId + RegisteredValuesMap[objId].FriendlyName + "</option>";
            }
            body += "</select>&nbsp;<span style='cursor: pointer' onclick=\"whoIsIt(" + this.Id + "_variable.value);\">Who is it?</span>";        
        }
        body += "</div>";       
	return body;
}

function scaledVariableUpdateValue(Id, source, value)
{
    switch (source)
    {
        case "InMin":
        {
                ObjectsMap[Id].InMin = value;
        }
        break;
        case "InMax":
        {
                ObjectsMap[Id].InMax = value;
        }
        break;
        case "OutMin":
        {
                ObjectsMap[Id].OutMin = value;
        }
        break;
        case "OutMax":
        {
                ObjectsMap[Id].OutMax = value;
        }
        break;        
    }
    console.log(value);
    $("#" + Id + "_in_text_value").text(ObjectsMap[Id].InMin +  " ... " + ObjectsMap[Id].InMax);
    $("#" + Id + "_out_text_value").text(ObjectsMap[Id].OutMin +  " ... " + ObjectsMap[Id].OutMax); 
    UpdateCode();
}

function scaledVariableUpdateVariableSource(Id, source)
{
    ObjectsMap[Id].InVariableSource = source;
    ShowSettingsPanel(Id, true);    
}

function scaledVariableUpdateVariable(Id, source, value)
{
        if (source == 0)
        {
            ObjectsMap[Id].InVariable[parseInt(source)] = ObjectsMap[Id].PassedVariables[parseInt(value)];
        }
        else if (source == 1)
        {
            ObjectsMap[Id].InVariable[parseInt(source)] = value;
        }
        UpdateCode();
}
