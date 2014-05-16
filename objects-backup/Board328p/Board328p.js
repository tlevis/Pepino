// ============== Arduino based settings (atmega 328p) ============== //
var DigitalPorts = [2,3,8,9,10,11,12,13];
var AnalogPorts = ["A0", "A1"];
var PWMPorts = [3,9,10,11];
var InterruptPorts = [2, 3];
var MotorsPortSpeed = { M1: 6, M2: 5 };
var MotorsPortDirection = { M1: 4, M2: 7 };
var LegoAnalogPort = { L1: "A0", L2: "A1", L3: "A2", L1: "A3" }

var targetEndpointMotor = {
	endpoint: "Rectangle",
	paintStyle:{ fillStyle:"#54b911", width:30, height: 30 },
	//hoverPaintStyle:connectorHoverStyle,
	maxConnections:1,
	scope: 'motor',
	dropOptions:{   hoverClass:"motor-hover", 
                    activeClass:"motor-active", 
                    activate: function( event, ui ) { 
                                    $('.motor-numbers').css({right: 50}); 
                                    $('.motor-description').css({right: 40});
                              },
                    deactivate: function( event, ui ) { 
                                    $('.motor-numbers').css({right: 20}); 
                                    $('.motor-description').css({right: 10});
                              }
                }, 
    parameters: {
		port: 0
    },    
	isTarget:true
};

var targetEndpointLego = {
	endpoint: "Rectangle",
	paintStyle:{ fillStyle:"#bbbdb8", width:30, height: 30 },
	//hoverPaintStyle:connectorHoverStyle,
	maxConnections:1,
	scope:'lego',
	dropOptions:{   hoverClass:"lego-hover", 
                    activeClass:"lego-active", 
                    activate: function( event, ui ) { 
                                    $('.lego-numbers').css({left: 50}); 
                                    $('.lego-description').css({left: 10});
                                    $('.digital-description').hide();                                    
                              },
                    deactivate: function( event, ui ) { 
                                    $('.lego-numbers').css({left: 20}); 
                                    $('.lego-description').css({left: -20});
                                    $('.digital-description').show();                                    
                              }
                },    
    parameters: {
		port: 0
    },
	isTarget:true
};

var targetEndpointAnalog = {
	endpoint: "Rectangle",
	paintStyle:{ fillStyle:"#ebb600", width:30, height: 30 },
	//hoverPaintStyle:connectorHoverStyle,
	maxConnections:1,
	scope:'analog',	
	dropOptions:{   hoverClass:"analog-hover", 
                    activeClass:"analog-active", 
                    activate: function( event, ui ) { 
                                    $('.analog-numbers').css({bottom: 50}); 
                                    $('.analog-description').css({bottom: 75});
                              },
                    deactivate: function( event, ui ) { 
                                    $('.analog-numbers').css({bottom: 20}); 
                                    $('.analog-description').css({bottom: 40});
                              }
                },    
    parameters: {
		port: 0
    },
	isTarget:true
};

var targetEndpointDigital = {
	endpoint: "Rectangle",
	paintStyle:{ fillStyle:"white", width:30, height: 30, strokeStyle: "black"},
    //hoverPaintStyle: { fillStyle:"red", radius:15 },
 	maxConnections:1,
	scope:'digital',
	beforeDrop:function(params) { 
		return true;//confirm("Connect " + params.sourceId + " to " + params.targetId + "?"); 
	},		
	dropOptions:{   hoverClass:"digital-hover", 
                    activeClass:"digital-active", 
                    activate: function( event, ui ) { 
                                    $('.digital-numbers').css({top: 50}); 
                                    $('.digital-description').css({top: 75});
                                    $('.lego-description').hide();
                                    $('.lego-numbers').hide();
                              },
                    deactivate: function( event, ui ) { 
                                    $('.digital-numbers').css({top: 20}); 
                                    $('.digital-description').css({top: 50});
                                    $('.lego-description').show();
                                    $('.lego-numbers').show();                                    
                              }
                },
    parameters: {
		port: 0,
        isPWM: false,
        isInterrupt: false
	},
    isTarget:true
};

var targetEndpointI2C = {
	endpoint: "Rectangle",
	paintStyle:{ fillStyle:"#1184b9", width:30, height: 30},
    //hoverPaintStyle: { fillStyle:"red", radius:15 },
 	maxConnections:1,
	scope:'i2c',
	beforeDrop:function(params) { 
		return true;//confirm("Connect " + params.sourceId + " to " + params.targetId + "?"); 
	},		
	dropOptions:{   hoverClass:"digital-hover", 
                    activeClass:"digital-active", 
                    activate: function( event, ui ) { 
                                    $('.digital-numbers').css({top: 50}); 
                                    $('.digital-description').css({top: 75});
                              },
                    deactivate: function( event, ui ) { 
                                    $('.digital-numbers').css({top: 20}); 
                                    $('.digital-description').css({top: 50});
                              }
                },
    parameters: {
		port: "i2c",
	},
    isTarget:true
};


function ObjectBoard() {
    this.Chain = {};
	this.Name = "Board";
    this.Id = this.Name;
	this.Chain["Next"] = null;
	this.Position = new ObjectPosition();	
	this.SetupMode = true;
}

ObjectBoard.prototype.Draw  = function(offset, working_area) {
	CreateObjectElement(this, "Board", offset, working_area);
	var sourceUUID;// = this.Id + "_InConnection_2";
	var i;
    var body = "";
	

    // Digital
    body += "<div class='digital-description'>Digital</div>";
    for (var idx in DigitalPorts)
    {
		sourceUUID = this.Id + "_InConnectionDigital_" + idx;
        var targetConnection = jQuery.extend(true, {}, targetEndpointDigital);
        targetConnection.parameters.port = DigitalPorts[idx];
        targetConnection.parameters.isPWM = (PWMPorts.indexOf(DigitalPorts[idx]) != -1);
        targetConnection.parameters.isInterrupt = (InterruptPorts.indexOf(DigitalPorts[idx]) != -1);
		jsPlumb.addEndpoint(this.Id, targetConnection, { anchor:[0.11 * (parseInt(idx) + 1), 0.0, 0, 0], uuid:sourceUUID });
        var pos = parseInt($("#" + this.Id).width()) * (0.11 * (parseInt(idx) + 1)) - idx * 1.3;
        body += "<div class='digital-numbers' style='color: white; position: absolute; top: 20px; left: " + pos + "px'>" + DigitalPorts[idx] + "</div>";        
    }	

	// i2c    
    body += "<div class='i2c-description'>i²c</div>";    
    sourceUUID = this.Id + "_InConnectionI2C_" + i;
    jsPlumb.addEndpoint(this.Id, targetEndpointI2C, { anchor:[0.3 * 2 + 0.2 , 1.0, 0, 0], uuid:sourceUUID });  
        
	// Analog
    body += "<div class='analog-description'>Analog</div>";
    for (var idx in AnalogPorts)
    {
		sourceUUID = this.Id + "_InConnectionAnalog_" + idx;
        var targetConnection = jQuery.extend(true, {}, targetEndpointAnalog);
        targetConnection.parameters.port = AnalogPorts[idx];
		jsPlumb.addEndpoint(this.Id, targetConnection, { anchor:[0.3 * parseInt(idx) + 0.2 , 1.0, 0, 0], uuid:sourceUUID });  
        var pos = parseInt($("#" + this.Id).width()) * (0.3 * parseInt(idx) + 0.18);
        body += "<div class='analog-numbers' style='color: white; position: absolute; bottom: 20px; left: " + pos + "px'>" + AnalogPorts[idx] + "</div>";        
    }
    
   
    // Motors
    body += "<div class='motor-description'>Motors</div>";
	for (var i = 1; i <= 2; i++)
	{
		sourceUUID = this.Id + "_InConnectionMotor_" + i;
        var targetConnection = jQuery.extend(true, {}, targetEndpointMotor);
        targetConnection.parameters.port = "M" + i;       
		jsPlumb.addEndpoint(this.Id, targetConnection, { anchor:[1.0, 0.33 * i, 0, 0], uuid:sourceUUID });
        var pos = parseInt($("#" + this.Id).height()) * (0.33 * (parseInt(i) - 1) + 0.3);
        body += "<div class='motor-numbers' style='color: white; position: absolute; top: " + pos + "px; right: 20px'>M" + i + "</div>";
	}
	
	// Lego
    body += "<div class='lego-description'>Lego</div>";
	for (var i = 1; i <= 4; i++)
	{
		sourceUUID = this.Id + "_InConnectionLego_" + i;
        var targetConnection = jQuery.extend(true, {}, targetEndpointLego);
        targetConnection.parameters.port = "L" + i;
		jsPlumb.addEndpoint(this.Id, targetConnection, { anchor:[0.0, 0.2 * i, 0, 0], uuid:sourceUUID });
        var pos = parseInt($("#" + this.Id).height()) * (0.2 * (parseInt(i) - 1) + 0.18);
        body += "<div class='lego-numbers' style='color: white; position: absolute; top: " + pos + "px; left: 20px'>L" + i + "</div>";
	}

    document.getElementById(this.Id).innerHTML = body;
	return this.Id;
}
