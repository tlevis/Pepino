var DelayTypes	= { MICRO:0, MILLI: 1 };
var ValueSource	= { NUM:0, VAR: 1 };
var DelayTypesNames	= ["Microseconds", "Milliseconds"];

var DelaysourceEndpoint = {
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
			cssClass:"DelayEndpointLabel" 
		} ]
	]    
};
var DelaytargetEndpoint = {
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
			cssClass:"DelayEndpointLabel" 
		} ]
	]    
};	

function ObjectDelay(value) {
    this.Chain = {};
	this.Name = "Delay";
    this.Id = this.Name;
    this.Category = "Functional";
	this.Type = (typeof type !== 'undefined') ? type : DelayTypes.MILLI;
    this.Source = ValueSource.NUM;
	this.Values = [((typeof value !== 'undefined') ? value : 1000), ""];
    //this.Variable = "";
	this.Chain["Next"] = null;
	this.Position = new ObjectPosition();
	this.SetupMode = false;
    this.PassedVariables;
}

ObjectDelay.prototype.GetCode = function(passedVars) {
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
    var code = (this.Type == DelayTypes.MILLI) ? "delay(" + this.Values[this.Source] + ");" : "delayMicroseconds(" + this.Values[this.Source] + ");";
    return new ObjectCode(code + CodeLoop, CodeSetup, CodeGlobal, CodeFunctions);
}

ObjectDelay.prototype.handleNewOutConnection  = function(conn) {
    this.Chain["Next"] = conn.targetId;    
}

ObjectDelay.prototype.handleNewInConnection  = function(conn) {
}

ObjectDelay.prototype.handleDeleteOutConnection  = function(conn) {
    this.Chain["Next"] = null;    
}

ObjectDelay.prototype.handleDeleteInConnection  = function(conn) {

}

ObjectDelay.prototype.Draw = function(offset, working_area) {
		CreateObjectElement(this, "Delay", offset, working_area);
		$("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');");	
		var sourceUUID = this.Id + "_OutConnection_Next";
		jsPlumb.addEndpoint(this.Id, DelaysourceEndpoint, { anchor:[0.9, 0.56, 0, 0], uuid:sourceUUID });
		sourceUUID = this.Id + "_InConnection";
		jsPlumb.addEndpoint(this.Id, DelaytargetEndpoint, { anchor:[0.1, 0.56, 0, 0], uuid:sourceUUID });

		var body = "<div style=\"position: absolute; top: 45px; left: 0px; right: 0px; width:100%; text-align:center; font-size: 14px\" ><div id='"+this.Id+"_delay_text_value'>" + ((parseInt(this.Source) == ValueSource.NUM) ? this.Values[ValueSource.NUM] : "variable") + "</div>"; 
		body += "<div id='"+this.Id+"_delay_text_type'>";
		body += (this.Type == DelayTypes.MILLI) ? "ms" : "&mus";
		body += "</div></div>";
		//body += RemoveButton(this.Id);
		document.getElementById(this.Id).innerHTML = body;
		return this.Id;
}

ObjectDelay.prototype.DrawSettingsPanel  = function() {
    var body = "<div style=\"line-height: 30px; vertical-align: middle\"><b>Delay:</b> <input type=\"radio\" id=\"" + this.Id + "_value_source\" name=\"" + this.Id + "_value_source\" value=\"" + ValueSource.NUM +"\" onclick=\"DelaySourceChanged('"+this.Id+"', this.value);\" "; 
	if (this.Source == ValueSource.NUM) {	body += " checked "; }
	body += "/> <input type='text' value='" + this.Values[ValueSource.NUM] + "' id='"+this.Id+"_delay' style=\"width:50px\" onchange=\"UpdateDelayTime('"+this.Id+"', " + this.Source + ", this.value)\"> ";
	body += "&nbsp;&nbsp;&nbsp;&nbsp;<input type=\"radio\" id=\"" + this.Id + "_value_source\" name=\"" + this.Id + "_value_source\" value=\"" + ValueSource.VAR + "\" onclick=\"DelaySourceChanged('"+this.Id+"', this.value);\" ";
	if (this.Source == ValueSource.VAR) {	body += " checked "; }
	body += "/> ";
    body += "<select id='"+this.Id+"_select_variable' onchange=\"UpdateDelayTime('"+this.Id+"', " + this.Source  + ", this.value)\">";
    for (var key in RegisteredValuesMap) {
        if (RegisteredValuesMap[key].ValueType != "int") break;
        body += "<option ";
		if (this.Values[ValueSource.VAR] == RegisteredValuesMap[key].VariableName) body += " selected=\"selected\" ";
		body += "value='"+ RegisteredValuesMap[key].VariableName+"'>"+RegisteredValuesMap[key].ObjectId+ RegisteredValuesMap[key].FriendlyName+"</option>";
			
	}
	body += "</select>&nbsp;<span style='cursor: pointer' onclick=\"whoIsIt(" + this.Id + "_select_variable.value);\">Who is it?</span></div><br/>";    
    body += "</div><br/>";
    
	body += "<div><b>Type:</b> <select id='"+this.Id+"_delay_type' onchange=\"UpdateDelayType('"+this.Id+"')\">";
	for (i = 0; i < DelayTypesNames.length; i++) {
		body += "<option ";
		if (this.Type == i) body += " selected=\"selected\" ";
		body += "value='"+i+"'>"+DelayTypesNames[i]+"</option>";
	}
	body += "</select></div><br/>";
	return body;
}

function DelaySourceChanged(Id, source)
{
    ObjectsMap[Id].Source = parseInt(source);   
    if (parseInt(ObjectsMap[Id].Source) === ValueSource.VAR)
    {
        ObjectsMap[Id].Values[ObjectsMap[Id].Source]  = $("#" + Id + "_select_variable").val();
    }
    else
    {
        ObjectsMap[Id].Values[ObjectsMap[Id].Source] = $("#" + Id + "_delay").val();
    }
    $("#"+Id+"_delay_text_value").html(((parseInt(ObjectsMap[Id].Source) === ValueSource.NUM) ? ObjectsMap[Id].Values[ValueSource.NUM] : "variable"));	
    UpdateCode();
}

function UpdateDelayType(Id) {
	ObjectsMap[Id].Type = document.getElementById(Id+'_delay_type').value;
	var type = (ObjectsMap[Id].Type == DelayTypes.MILLI) ? " ms" : "µs";
	$("#"+Id+"_delay_text_type").html(type);
	UpdateCode();
}

function UpdateDelayTime(Id, source, value) {
	ObjectsMap[Id].Values[source] = value;
	$("#"+Id+"_delay_text_value").html(((parseInt(ObjectsMap[Id].Source) === ValueSource.NUM) ? ObjectsMap[Id].Values[ValueSource.NUM] : "variable"));	
	UpdateCode();
}