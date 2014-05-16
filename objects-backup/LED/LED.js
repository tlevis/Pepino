var PWMSources = ["Number", "Scope Variable", "Global Variable"];

var LEDSetupSourceEndpoint = {
	endpoint:"Rectangle",
	paintStyle:{ fillStyle:"white", width:25, height: 25, strokeStyle: "black"},
	isSource:true,
	parameters: {
		pwm: true
	},
	connectorStyle:connectorPaintStyle,
	hoverPaintStyle:connectorHoverStyle,
	connectorHoverStyle:connectorHoverStyle,
    scope: 'digital'
};

var LEDsourceEndpoint = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	isSource:true,
	parameters: {
		pwm: true
	},
    beforeDrop: function(params) { 
        return (!(params.sourceId == params.targetId));
	},    
	connectorStyle:connectorPaintStyle,
	hoverPaintStyle:connectorHoverStyle,
	connectorHoverStyle:connectorHoverStyle,
	overlays:[
		[ "Label", { 
			location:[1.6, 0.5], 
			label:"Next",
			cssClass:"LEDendpointLabel" 
		} ]
	]    
};

var LEDtargetEndpoint = {
	endpoint: "Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	hoverPaintStyle:connectorHoverStyle,
	maxConnections:1,
	dropOptions:{ hoverClass:"hover", activeClass:"active" },
	isTarget:true,
	overlays:[
		[ "Label", { 
			location:[-0.5, 0.5], 
			label:"In",
			cssClass:"LEDendpointLabel" 
		} ]
	]    
};	
			
function ObjectLED (port, signal) {
    this.Chain = {};
	this.Name = "LED";
    this.Id = this.Name;
	this.Port = port;
    this.Category = "Digital";
	this.Signal = (typeof signal !== 'undefined') ? signal : PortSignals.LOW;
	this.Chain["Next"] = null;
	this.PortType = OutputPortTypes.DIGITAL;
	this.PWMValues =  ["0", "", ""];
	this.Position = new ObjectPosition();
	this.SetupMode = false;
    this.PWMSourceValue = 0;
    this.PassedVariables;
}

ObjectLED.prototype.GetCode = function(passedVars) {
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
	
	var selfSetupCode = (Ports["p"+this.Port] == undefined) ? "pinMode(" + this.Port + ", OUTPUT);" : "";
	// Deprecated
    Ports["p"+this.Port] = this.Port;
	
	var code = "";
	if (this.PortType == OutputPortTypes.DIGITAL) {
		code = "digitalWrite(" + this.Port + "," + this.Signal + ");";
	}else if (this.PortType == OutputPortTypes.PWM) {
		code = "analogWrite(" + this.Port + "," + this.PWMValues[this.PWMSourceValue] + ");";
	}
	return  new ObjectCode(code + CodeLoop, selfSetupCode + CodeSetup, CodeGlobal, CodeFunctions);
}

ObjectLED.prototype.handleNewOutConnection  = function(conn) {
    this.Chain["Next"] = conn.targetId;
}

ObjectLED.prototype.handleNewInConnection  = function(conn) {
}

ObjectLED.prototype.handleDeleteOutConnection  = function(conn) {
    this.Chain["Next"] = null;
}

ObjectLED.prototype.handleDeleteInConnection  = function(conn) {
}

ObjectLED.prototype.Draw  = function(offset, working_area) {
	var img = "images/ONOFF_OFF.png";
	
	if (this.Signal == PortSignals.HIGH) {
		img = "images/ONOFF_ON.png";
	}

	CreateObjectElement(this, "LED", offset, working_area);
	if (this.SetupMode == false) { $("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');"); }

	var sourceUUID = this.Id + "_OutConnection_Next";    
    var endpointAnchor = (this.SetupMode == true) ? [[0.98, 0.5, 0, 0], [0.5, 0.98, 0, 0], [0.05, 0.5, 0, 0], [0.5, 0, 0, 0]] : [0.9, 0.6, 0, 0];
	jsPlumb.addEndpoint(this.Id, ((this.SetupMode == true) ? LEDSetupSourceEndpoint : LEDsourceEndpoint), { anchor:endpointAnchor, uuid:sourceUUID });


    
	var body = "";
    if (this.SetupMode == false)
    {
        sourceUUID = this.Id + "_InConnection";  
        jsPlumb.addEndpoint(this.Id, LEDtargetEndpoint, { anchor:[0.1, 0.6, 0, 0], uuid:sourceUUID });
        body += "<div style=\"font-family: 'ohw-font'; color: white; position: absolute; top: 20px; right: 13px; width: 25px; text-align:center\">" + this.Port + "</div>";

        body += "<div align='center' style=\"font-size:14px; position: absolute; top: 50px; left: 0px; right: 0px; text-align: center\">";
        var portType = "Digital";
        var portValue = (this.Signal == PortSignals.HIGH) ? "On" : "Off";

        if (this.PortType == OutputPortTypes.PWM)
        {
            portType =  "PWM";
            portValue = this.PWMValues[0];
            if (this.PWMSourceValue == 2 || this.PWMSourceValue == 1)
                portValue = "variable";
        }
        body += "<span id=\"" + this.Id + "-port-type\">" + portType + "</span><br/>";
        body += "<span id=\"" + this.Id + "-port-value\">" + portValue + "</span>";
        body += "</div>";
    }
    else
    {
        body += RemoveButton(this.Id);
    }
	document.getElementById(this.Id).innerHTML = body;
	return this.Id;
}

ObjectLED.prototype.AfterDraw = function()
{

}

ObjectLED.prototype.DrawSettingsPanel  = function() {
	var css = "switch_off";
	if (this.Signal == PortSignals.HIGH) {
        css = "switch_on";
	}

	var body = "<div><b>Port:</b> " + this.Port + "</div>";
    if (PWMPorts.indexOf(this.Port) != -1) 
    {
        body += "<div style=\"line-height: 30px; vertical-align: middle\"><b>Mode:</b> <input type=\"radio\" id=\"" + this.Id + "_port_type\" name=\"" + this.Id + "_port_type\" value=\""+OutputPortTypes.DIGITAL+"\" onclick=\"LEDPortTypeChanged('"+this.Id+"', this.value);\" "; 
        if (this.PortType == OutputPortTypes.DIGITAL) {	body += " checked "; }
        body += "/> Digital ";
        body += "&nbsp;&nbsp;&nbsp;&nbsp;<input type=\"radio\" id=\"" + this.Id + "_port_type\" name=\"" + this.Id + "_port_type\" value=\""+OutputPortTypes.PWM+"\" onclick=\"LEDPortTypeChanged('"+this.Id+"', this.value);\" ";
        if (this.PortType == OutputPortTypes.PWM) {	body += " checked "; }
        body += "/>PWM </div>";
    }
    else
    {
        body += "<div style=\"line-height: 30px; vertical-align: middle\"><b>Mode:</b> Digital</div>";
    }
	if (this.PortType == OutputPortTypes.DIGITAL) {
		body += "<div style='height: 36px;vertical-align: middle; display: inline-block;'><b>Status:</b> </div><div style='display: inline-block' id='"+this.Id+"_ONOFF_signal' class='"+css+"' onclick=\"UpdateSignal('"+this.Id+"');\"></div>";	// <img src='"+img+"' alt='"+tip+"' title='"+tip+"' signal=\""+this.Signal+"\" id='"+this.Id+"_ONOFF_signal'
	}else if (this.PortType == OutputPortTypes.PWM) {
		body += "<div id=\"" + this.Id +"_pwm_div\">";
        body += "   <div style=\"display: inline-block\"><b>Value type:</b></div>";
        body += "   <div style=\"display: inline-block\">";
        body += "       <select id=\"" + this.Id + "_pwm_value_source\" onchange=\"updatePWMSourceValue('" + this.Id + "', this.value);\">";
        for (var idx in PWMSources) {
            idx = idx + "";
            body += "<option ";
            if (this.PWMSourceValue == idx) body += " selected=\"selected\" ";
            body += "value='" + idx + "'>" + PWMSources[idx] + "</option>";
                
        }
        body += "       </select>";
        body += "   </div>";
        if (this.PWMSourceValue == "0")
        {        
            body += "<div style=\"display: block\">"
            body += "   <div id=\"" + this.Id + "-slider-value\"><b>PWM value:</b> " + this.PWMValues[0]  + "</div>";
            body += "   <div style=\"padding-left: 3px;\"><div id=\"" + this.Id + "-slider\" style=\"width:150px\"></div>";
            body += "</div>";
            setTimeout( "LEDShowPWMSlider('" + this.Id + "');",100);
        }
        
        if (this.PWMSourceValue == "1")
        {        
            body += "       <select id=\"" + this.Id + "_pwm_value\" onblur=\"updatePWMVariable('" + this.Id + "', 1, this.value)\">";
            for (var idx in this.PassedVariables) {
                body += "<option ";
                if (this.PWMValues[1] == this.PassedVariables[idx]) body += " selected=\"selected\" ";
                body += "value='" + idx + "'>" + this.PassedVariables[idx] + "</option>";
            }
            body += "       </select>";
        }        
        
        if (this.PWMSourceValue == "2")
        {
            body += "<select id='" + this.Id + "_pwm_value' onblur=\"updatePWMVariable('" + this.Id + "',2, this.value)\">";
            for (var objId in RegisteredValuesMap) {
                body += "<option ";
                if (this.PWMValues[2] == RegisteredValuesMap[objId].VariableName) body += " selected=\"selected\" ";
                body += "value='" + RegisteredValuesMap[objId].VariableName + "'>" + RegisteredValuesMap[objId].ObjectId + RegisteredValuesMap[objId].FriendlyName + "</option>";
            }
            body += "</select>&nbsp;<span style='cursor: pointer' onclick=\"whoIsIt(" + this.Id + "_pwm_value.value);\">Who is it?</span>";        
        }
        body += "</div>";       
	}
	return body;
}

function LEDShowPWMSlider(Id) {
	$( "#" + Id + "-slider" ).slider({
		range: "min",
		value: ObjectsMap[Id].PWMValues[0],
		min: 0,
		max: PWM_MAX_VALUE,
		slide: function( event, ui ) {
			$( "#" + Id + "-slider-value" ).html("PWM value: " + ui.value );
			ObjectsMap[Id].PWMValues[0] = ui.value;
            $("#" + Id + "-port-value").html(ObjectsMap[Id].PWMValues[0]);
			if (ObjectsMap[Id].PWMSourceValue == "0")
            {
                UpdateCode();
            }
		}
	});
	$("#" + Id + "-slider").children("div").css("background","#fead00");
}

function updatePWMSourceValue(Id, source)
{
    ObjectsMap[Id].PWMSourceValue = source;
    LEDPortTypeChanged(Id, ObjectsMap[Id].PortType);
    ShowSettingsPanel(Id, true);    
}

function updatePWMVariable(Id, source, value)
{
        if (source == 1)
        {
            ObjectsMap[Id].PWMValues[parseInt(source)] = ObjectsMap[Id].PassedVariables[parseInt(value)];
        }
        else if (source == 2)
        {
            ObjectsMap[Id].PWMValues[parseInt(source)] = value;
        }
        UpdateCode();
}

function LEDPortTypeChanged(Id, value) {
	ObjectsMap[Id].PortType = value;
	if (ObjectsMap[Id].PortType == OutputPortTypes.DIGITAL)
    {
        $("#" + Id + "-port-type").text("Digital");
        $("#" + Id + "-port-value").html( (ObjectsMap[Id].Signal == PortSignals.HIGH) ? "On" : "Off" );
    }
    else
    {
        $("#" + Id + "-port-type").text("PWM");
        var portValue = ObjectsMap[Id].PWMValues[ObjectsMap[Id].PWMSourceValue];
        if (ObjectsMap[Id].PWMSourceValue == "2" || ObjectsMap[Id].PWMSourceValue == "1")
            portValue = "variable";
            
        $("#" + Id + "-port-value").html(portValue);
    }
	
    ShowSettingsPanel(Id, true);
	UpdateCode();
}

function UpdatePort(Id) {
	ObjectsMap[Id].Port = document.getElementById(Id+'_select_port').value;
	UpdateCode();
}

function UpdateSignal(Id) {
	var tip = "Turn ON";
	var style = "switch_off";
    
	if (ObjectsMap[Id].Signal == PortSignals.LOW) {
		txt = "ON";
		ObjectsMap[Id].Signal = PortSignals.HIGH;
		tip = "Turn OFF";
		style = "switch_on";
        $("#" + Id + "-port-value").text("On");       
	}
    else
    {
        ObjectsMap[Id].Signal = PortSignals.LOW
        $("#" + Id + "-port-value").text("Off");
    }

	$("#"+Id+"_ONOFF_signal").attr('alt', tip);
	$("#"+Id+"_ONOFF_signal").attr('title', tip);
	$("#"+Id+"_ONOFF_signal").attr('class',style);
	UpdateCode();
}