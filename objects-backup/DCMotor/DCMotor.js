var DCMotorSpeedSource = ["Number", "Scope Variable", "Global Variable"];

var DCMotorSetupSourceEndpoint = {
	endpoint:"Rectangle",
	paintStyle:{ fillStyle:"#54b911", width: 25, height: 25 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	connectorHoverStyle:connectorHoverStyle,
    scope: 'motor'
};

var DCMotorSourceEndpoint = {
	endpoint:"Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	isSource:true,
	connectorStyle:connectorPaintStyle,
	connectorHoverStyle:connectorHoverStyle,
	overlays:[
		[ "Label", { 
			location:[1.6, 0.5], 
			label:"Next",
			cssClass:"DCMotorEndpointLabel" 
		} ]
	]      
};

var DCMotorTargetEndpoint = {
	endpoint: "Dot",
	paintStyle:{ fillStyle:"#1a92d7",radius: 12 },
	maxConnections:-1,
	dropOptions:{ hoverClass:"hover", activeClass:"active" },
	isTarget:true,
	overlays:[
		[ "Label", { 
			location:[-0.5, 0.5], 
			label:"In",
			cssClass:"DCMotorEndpointLabel" 
		} ]
	]     
};	
			
function ObjectDCMotor () {
    this.Chain = {};
	this.Name = "DCMotor";
    this.Id = this.Name;
    this.Category = "Motors";
	this.Port = "M1";
    this.Direction = PortSignals.LOW;
    this.SpeedValues =  ["255", "", ""];
    this.SpeedSource =  0;
	this.Chain["Next"] = null;
	this.Position = new ObjectPosition();
	this.SetupMode = false;
    this.Variables = [];
    this.PassedVariables;
}

ObjectDCMotor.prototype.GetCode = function(passedVars) {
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
    
    var selfSetupCode =  "pinMode(" + MotorsPortDirection[this.Port] + ", OUTPUT);";
    
    var selfLoopCode = "digitalWrite(" + MotorsPortDirection[this.Port] + ", " + this.Direction + ");\n";
    selfLoopCode += "analogWrite(" + MotorsPortSpeed[this.Port] + ", " + this.SpeedValues[this.SpeedSource] + ");\n";

	return  new ObjectCode(selfLoopCode + CodeLoop, selfSetupCode + CodeSetup, CodeGlobal, CodeFunctions);
}

ObjectDCMotor.prototype.handleNewOutConnection  = function(conn) {
    this.Chain["Next"] = conn.targetId;    
}

ObjectDCMotor.prototype.handleNewInConnection  = function(conn) {
}

ObjectDCMotor.prototype.handleDeleteOutConnection  = function(conn) {
    this.Chain["Next"] = null;    
}

ObjectDCMotor.prototype.handleDeleteInConnection  = function(conn) {
}

ObjectDCMotor.prototype.Draw  = function(offset, working_area) {
	var body = "";
    
	CreateObjectElement(this, "DCMotor", offset, working_area);
	if (this.SetupMode == false) { $("#" + this.Id).attr("onclick", "ShowSettingsPanel('" + this.Id + "');"); }
	var sourceUUID = this.Id + "_OutConnection_Next";  
    var endpointAnchor = (this.SetupMode == true) ? [[0.98, 0.5, 0, 0], [0.5, 0.98, 0, 0], [0.05, 0.5, 0, 0], [0.5, 0, 0, 0]] : [0.9, 0.62, 0, 0];
    jsPlumb.addEndpoint(this.Id, ((this.SetupMode == true) ? DCMotorSetupSourceEndpoint : DCMotorSourceEndpoint) , { anchor: endpointAnchor, uuid:sourceUUID });
	sourceUUID = this.Id + "_InConnection";
    if (this.SetupMode == false)
    {
        jsPlumb.addEndpoint(this.Id, DCMotorTargetEndpoint, { anchor:[0.10, 0.62, 0, 0], uuid:sourceUUID });
        
        body += "<div style=\"font-family: 'ohw-font'; color: white; position: absolute; top: 25px; right: 13px; width: 25px; text-align:center\">" + this.Port + "</div>";
        body += "<canvas id=\"" + this.Id + "_speedCanvas\" width=\"110\" height=\"23\" style='position: absolute; bottom: 0px'></canvas>";
        body += "<div id=\"" + this.Id + "_direction_image\" class=\"" + ( (this.Direction == PortSignals.LOW) ? "DCMotor-cw" : "DCMotor-ccw") +"\"></div>";
    }
    else
    {
        body += RemoveButton(this.Id);
    }    
    
	document.getElementById(this.Id).innerHTML = body;
    if (this.SetupMode == false)
    {
        DCMotorUpdateSpeedNeedle(this.Id, parseFloat(parseInt(this.SpeedValues[0]) / PWM_MAX_VALUE), '#ff0000');
    }
	return this.Id;
}

ObjectDCMotor.prototype.AfterDraw = function()
{
    if (this.SetupMode == true) return;
    this.Variables.push(this.Id + "_0");
}


ObjectDCMotor.prototype.DrawSettingsPanel  = function() {
	var body = "";
    body += "<div id=\"" + this.Id +"_direction_div\">";
    body += "   <div style=\"display: inline-block\"><b>Direction:</b></div>"; 
    body += "   <div style=\"display: inline-block\">";
    body += "       <select id=\"" + this.Id + "_direction_select\" onchange=\"DCMotorUpdateDirection('" + this.Id + "', this.value);\">";
    body += "           <option value=\"LOW\" " + ( (this.Direction == PortSignals.LOW) ? " selected=\"selected\" " : "") + ">Clockwise</option>";
    body += "           <option value=\"HIGH\" " + ( (this.Direction == PortSignals.HIGH) ? " selected=\"selected\" " : "") + ">Counter Clockwise</option>";    
    body += "       </select>";    
    body += "</div>"
    body += "<br/><br/>";
    body += "<div id=\"" + this.Id +"_pwm_div\">";
    body += "   <div style=\"display: inline-block\"><b>Value type:</b></div>";
    body += "   <div style=\"display: inline-block\">";
    body += "       <select id=\"" + this.Id + "_pwm_value_source\" onchange=\"DCMotorUpdateSpeedSource('" + this.Id + "', this.value);\">";
    for (var idx in DCMotorSpeedSource) {
        idx = idx + "";
        body += "<option ";
        if (this.SpeedSource == idx) body += " selected=\"selected\" ";
        body += "value='" + idx + "'>" + DCMotorSpeedSource[idx] + "</option>";
            
    }
    body += "       </select>";
    body += "   </div>";
    if (this.SpeedSource == "0")
    {        
        body += "<div style=\"display: block\">"
        body += "   <div id=\"" + this.Id + "-slider-value\"><b>PWM value:</b> " + this.SpeedValues[0]  + "</div>";
        body += "   <div style=\"padding-left: 3px;\"><div id=\"" + this.Id + "-slider\" style=\"width:150px\"></div>";
        body += "</div>";
        setTimeout( "DCMotorShowPWMSlider('" + this.Id + "');",100);
    }
    if (this.SpeedSource == "1")
    {        
        body += "       <select id=\"" + this.Id + "_pwm_value\" onblur=\"DCMotorUpdatePWMVariable('" + this.Id + "', 1, this.value)\">";
        for (var idx in this.PassedVariables) {
            body += "<option ";
            if (this.SpeedValues[1] == this.PassedVariables[idx]) body += " selected=\"selected\" ";
            body += "value='" + idx + "'>" + this.PassedVariables[idx] + "</option>";
                
        }
        body += "       </select>";
    }        
    
    if (this.SpeedSource == "2")
    {
        body += "<select id='" + this.Id + "_pwm_value' onblur=\"DCMotorUpdatePWMVariable('" + this.Id + "',2, this.value)\">";
        for (var objId in RegisteredValuesMap) {
            body += "<option ";
            if (this.SpeedValues[2] == RegisteredValuesMap[objId].VariableName) body += " selected=\"selected\" ";
            body += "value='" + RegisteredValuesMap[objId].VariableName + "'>" + RegisteredValuesMap[objId].ObjectId + RegisteredValuesMap[objId].FriendlyName + "</option>";
        }
        body += "</select>&nbsp;<span style='cursor: pointer' onclick=\"whoIsIt(" + this.Id + "_pwm_value.value);\">Who is it?</span>";        
    }
    
	return body;
}

function DCMotorUpdateSpeedSource(Id, source)
{
    ObjectsMap[Id].SpeedSource = source;
    if (source != 0)
    {
        DCMotorUpdateSpeedNeedle(Id, 0, '#5c5c5c');
    }
        
    ShowSettingsPanel(Id, true);    
}

function DCMotorUpdateDirection(Id, direction)
{
    ObjectsMap[Id].Direction = direction;
    if (direction == PortSignals.LOW)
    {
        $("#" + Id + "_direction_image").attr('class', 'DCMotor-cw');
    }
    else
    {
        $("#" + Id + "_direction_image").attr('class', 'DCMotor-ccw');
    }
    UpdateCode();
}

function DCMotorUpdateSpeedNeedle(Id, value, color)
{
        var canvas = document.getElementById(Id + "_speedCanvas");
        var context = canvas.getContext('2d');
        
        context.clearRect(0,0,110,23);
       
        var startX = canvas.width / 2 + 1;
        var startY = 20;

        value = scaleValue(value, 0, 1, 0.1, 0.9);

        var range = Math.PI;
        var armRadians = (range * value) - range;
        var armLength = 20;
        
        var targetX = startX + Math.cos(armRadians) * armLength;
        var targetY = startY + Math.sin(armRadians) * armLength;
           
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(targetX, targetY);
        context.lineWidth = 2;
        context.strokeStyle = color;        
        context.stroke();
}

function DCMotorUpdatePWMVariable(Id, source, value)
{
        if (source == 1)
        {
            ObjectsMap[Id].SpeedValues[parseInt(source)] = ObjectsMap[Id].PassedVariables[parseInt(value)];
        }
        else if (source == 2)
        {
            ObjectsMap[Id].SpeedValues[parseInt(source)] = value;
        }
        UpdateCode();
}


function DCMotorShowPWMSlider(Id) {
	$( "#" + Id + "-slider" ).slider({
		range: "min",
		value: ObjectsMap[Id].SpeedValues[0],
		min: 0,
		max: PWM_MAX_VALUE,
		slide: function( event, ui ) {
			$( "#" + Id + "-slider-value" ).html("PWM value: " + ui.value );
			ObjectsMap[Id].SpeedValues[0] = ui.value;
            $("#" + Id + "-port-value").html(ObjectsMap[Id].SpeedValues[0]);
			if (ObjectsMap[Id].SpeedSource == "0")
            {
                UpdateCode();
                DCMotorUpdateSpeedNeedle(Id, parseFloat(ui.value / PWM_MAX_VALUE), '#ff0000');
            }
		}
	});
	$("#" + Id + "-slider").children("div").css("background","#fead00");
}
