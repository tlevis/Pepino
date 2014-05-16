<?php
    session_start();
    header('Content-Type: application/javascript');
?>

//*************** WIFI ***************//

    function GetSignalIcon(signal)
    {
        var icon = 0;
        if (signal >= 0.2 && signal < 0.4)
        {
            icon = 1;
        }
        else if (signal >= 0.4 && signal < 0.6)
        {
            icon = 2;
        }
        else if (signal >= 0.6 && signal < 0.8)
        {
            icon = 3;
        }
        else if (signal >= 0.8 && signal <= 1)
        {
            icon = 4;
        }
        return icon;
    }

    function GetWifiNetworks()
    {
        $.getJSON( "get-wifi-networks.php", function(data) {
            var html = "";
            var id = 0;
            if (data != null)
            {
                wifiNetworks = data;
                $.each( data, function( key, network ) {
                    if (id > 0) {
                        html += "<div style='width: 90%; height: 5px; border-top: 1px solid #b2b2b2; margin:0 auto' ></div>";
                    }
                    html += "<div class='wifi-cell' id='wifi-cell-id-" + id + "' ondblclick='ConnectToNetwork(" + id + ");' onclick=\"unselectWifiCell(" + id + ");\">";
                    html += "	<div style='display:inline-block;vertical-align:middle; width: 40px'><img src='images/wifi/wifi-signal-" + GetSignalIcon(network.Signal) + ".png' /></div>";
                    html += "	<div id='wifi-cell-network-name-id-" + id + "' style='display:inline-block;vertical-align:middle; font-size: 12px; z-index:3'>";
                    html += "		<div>" + network.Name + ( (network.Encrypted == true) ? " (secure)" : "") + "</div>";
                    html += "	</div>";
                    html += "</div>";
                    html += "<div style='height: 5px'></div>"; // Spacer                
                    id++;
                });
            }
            $("#wifi-list").html(html);
        });                
    }
    
    function unselectWifiCell(id)
    {
        if (currentActiveWifiCell !== "" && id != currentActiveWifiCell)
        {
            html = "<div>" + wifiNetworks[currentActiveWifiCell].Name + ( (wifiNetworks[currentActiveWifiCell].Encrypted == true) ? " (secure)" : "") + "</div>";
            $("#wifi-cell-network-name-id-" + currentActiveWifiCell).html(html);
            currentActiveWifiCell = "";
        }
    }

    function ConnectToNetwork(id, password)
    {
        if (isConnecting == true) return;
        
        if (typeof password === 'undefined') password = "";
        
        if (wifiNetworks[id].Encrypted == true && password == "")
        {
            currentActiveWifiCell = id;
            var html = "Password: <input type=\"text\" id=\"settings-wifi-password\" style=\"width: 70px\" /> <button id=\"settings-wifi-connect-button\" onclick=\"ConnectToNetwork(" + id + ",$('#settings-wifi-password').val());\">Connect</button>";
            $("#wifi-cell-network-name-id-" + id).html(html);
        }
        else
        {
            isConnecting = true;
            $("#settings-dialog-connecting-modal" ).dialog( "open" );
            currentActiveWifiCell = "";
            $("#settings-network-group").prop('disabled', true);
            
            var connectionPacket = {};
            connectionPacket["Network"] = wifiNetworks[id];
            connectionPacket["Password"] = password;
            var postData = {data: JSON.stringify(connectionPacket)};
            $.post("system-scripts/select-wifi.php", postData)
                .done(function( data ) {
                    if (data == "FAIL")
                    {
                        alert( "Error: Unable to connect" );
                        LoadSettings();
                        $("#settings-network-group").prop('disabled', false);
                        isConnecting = false;
                        $("#settings-dialog-connecting-modal" ).dialog( "close" );
                    }
                    else
                    {
                        alert( "Connected to " + (wifiNetworks[id].Name) );
                        LoadSettings();
                        $("#settings-network-group").prop('disabled', false);
                        isConnecting = false;
                        $("#settings-dialog-connecting-modal" ).dialog( "close" );
                    }
                })
                .fail(function() {
                    alert( "Error: Unable to connect" );
                    LoadSettings();                
                    $("#settings-network-group").prop('disabled', false);
                    isConnecting = false;
                    $("#settings-dialog-connecting-modal" ).dialog( "close" );
                });
        }
    }
            
//*************************************//         

    function LoadSettings()
    {
        $.getJSON( "load-settings.php", function(data) {
            $("#settings-device-name").val(data["hostname"]);
            $("#settings-autosave").val(data["autosave"]);
            autosaveInterval = 60000 * parseInt(data["autosave"]);
            if (autosaveInterval > 0)
            {
                if (autosaveTimer != null)
                {
                    clearInterval(autosaveTimer);
                }
                autosaveTimer = window.setInterval("SaveProject(true)", autosaveInterval);
            }           
            $("#settings-conncted-wifi").text( (data["wifi"] == "" || data["wifi"] == null) ? "None" : data["wifi"] );
        });                
        $.getJSON( "get-network-ips.php", function(data) {
            $("#settings-ethernet-ip").text(data["ethernet"]);
            $("#settings-wifi-ip").text(data["wifi"]);            
        });
        GetWifiNetworks();
    }
    
    function SaveSettings()
    {
        var postData = {hostname: $("#settings-device-name").val(), autosave: $("#settings-autosave").val() };
        $.post("system-scripts/save-settings.php", postData);
        LoadSettings();
        $("#settings-dialog-modal" ).dialog( "close" );
    }

   

function JSONData() {
    this.ProjectName = "Untitled";
    this.ProjectDescription = "Autosaved";
	this.CurrentIndex = null;
	this.Ports = null;
    this.ObjArray = null;
    this.ObjectsOnSetupAreaMap = null;
    this.ConnectedObjectsMap = null;
    this.RegisteredValuesMap = null;
    this.ConnectionsMap = null;
}

function SaveProject(autosave, overwrite) {
    if (typeof autosave === 'undefined')
        autosave = false;
	
    if (typeof overwrite === 'undefined')
        overwrite = false;

    var sendData = new JSONData();
	sendData.CurrentIndex = object_index;
	sendData.ObjArray = ObjectsMap;
    sendData.ObjectsOnSetupAreaMap = ObjectsOnSetupAreaMap;
    sendData.ConnectedObjectsMap = ConnectedObjectsMap;
    sendData.RegisteredValuesMap = RegisteredValuesMap;
    sendData.Ports = Ports;
    sendData.ConnectionsMap = ConnectionsMap;

    if (autosave == false)
    {
        sendData.ProjectName = (overwrite) ? currentActiveProject.Name : $("#save-project-name").val();
        if (sendData.ProjectName == "")
        {
            alert("Please type project name.");
            $("#save-project-name").focus();
            return;
        }
        sendData.ProjectDescription = (overwrite) ? currentActiveProject.Description : $("#save-project-description").val();
        
        currentActiveProject.Name = sendData.ProjectName;
        currentActiveProject.Description = sendData.ProjectDescription;

        showNotification("Saving...");  
 
        // we use post to hidden frame because saving to file cannot be done with $.post
        console.log(overwrite);
        document.getElementById("frm-save-overwrite").value = parseInt(overwrite+0);
        document.getElementById("frm-save-file-name").value = (overwrite) ? currentActiveProject.Filename : "";
        document.getElementById("frm-save-location").value = (overwrite) ? "device" : $("#save-project-location").val();
        document.getElementById("frm-save-json-obj").value = beautify(JSON.stringify(sendData));        
        document.getElementById("frm_save").submit();        
        
        $("#status-project-name-value").html(currentActiveProject.Name);
        $("#status-description-value").html(currentActiveProject.Description);               
    
        $("#save-project-name").val("");
        $("#save-project-description").val("");
        $("#save-dialog-modal" ).dialog( "close" );
    }
    else
    {
        showNotification("Autosaving...");
        var postData = {project:beautify(JSON.stringify(sendData))};
        $.post("save.php?autosave=1",postData);
    }
}

function updateCurrentActiveProjectFilename(name)
{
    currentActiveProject.Filename = name;
}

function removeAutosave()
{
    $.post("delete-autosave.php","");
    alert("Done!");
}

function burnCode()
{
    $("#form-burn-code").submit();
    RemoveClickFromBurnButton();
}   

function LoadFile(content, fileName) {
    if (typeof fileName === 'undefined')
        fileName = "";
	
    if (content != "") {
		disableObjectCounter = true;
		var getData = JSON.parse(content);
		object_index = getData.CurrentIndex;
        Ports = getData.Ports;
		
        
        // Remove all the current data:
        for (var o in ObjectsMap) {     // Remove the DOM objects
            RemoveObject(o);
        }
        ObjectsMap = [];        
        
        for (var o in ObjectsOnSetupAreaMap) {  // Remove the DOM objects
            RemoveObject(o);
        }
        ObjectsOnSetupAreaMap = [];
        ConnectedObjectsMap = [];        
        RegisteredValuesMap = [];
        ConnectionsMap = [];
        CodeIncludes = [];
        CodeLibraryFunctions = [];
        CodeSetupInitialize = [];
        
        // Rebuild all:
        // ************
    
        // Show the area that we going to draw on it 
        // This solves the problem that the objects are not drawn at correct position
        $( "#working-area" ).hide();
        $( "#device-setup-area" ).show();
        
        currentActiveProject.Name = getData.ProjectName;
        currentActiveProject.Description = getData.ProjectDescription;
        currentActiveProject.Filename = (fileName != "") ? fileName : null;        
        
        $("#status-project-name-value").html(currentActiveProject.Name);
        $("#status-description-value").html(currentActiveProject.Description);        
        
        ConnectionsMap = getData.ConnectionsMap;
        ObjectsOnSetupAreaMap = getData.ObjectsOnSetupAreaMap;
		
        for (var o in ObjectsOnSetupAreaMap) {
			SetProtos(o, ObjectsOnSetupAreaMap);
            ObjectsOnSetupAreaMap[o].Draw({top: ObjectsOnSetupAreaMap[o].Position.Y, left: ObjectsOnSetupAreaMap[o].Position.X}, 'device-setup-area');             
            if (typeof ObjectsOnSetupAreaMap[o].AfterDraw === 'function')
            {
                ObjectsOnSetupAreaMap[o].AfterDraw();
            }   
		}       
        
        // Connect all the objects in "device-setup-area"
		for (var conn in ConnectionsMap) {
            if (ConnectionsMap[conn].Area == "device-setup-area")
                jsPlumb.connect({uuids:[ConnectionsMap[conn].Source, ConnectionsMap[conn].Target]});        
		}        

        ConnectedObjectsMap = getData.ConnectedObjectsMap;
		for (var o in ConnectedObjectsMap) {
			SetProtos(o, ConnectedObjectsMap);
		}
        UpdateToolBox();        
        
        RegisteredValuesMap = getData.RegisteredValuesMap;
        
		
		ObjectsMap = getData.ObjArray;
		for (var o in ObjectsMap) {
			SetProtos(o, ObjectsMap);
		}
        
        $( "#working-area" ).show();
        $( "#device-setup-area" ).hide();       
        RecursiveDraw("Main1", ObjectsMap);
        
        // Connect all the objects in "working-area"
		for (var conn in ConnectionsMap) {
            if (ConnectionsMap[conn].Area == "working-area")
            {
                jsPlumb.connect({uuids:[ConnectionsMap[conn].Source, ConnectionsMap[conn].Target]});        
            }
		}
		
        UpdateCode();
		disableObjectCounter = false;
        
        $( "#working-area" ).hide();
        $( "#device-setup-area" ).show();
        
        if ( $("#toggle-mode").hasClass('design-program-on') ) {
            $("#toggle-mode").removeClass('design-program-on').addClass('design-program-off');
        }
	}
}

function GetDeviceProjectList()
{
    $.getJSON( "get-device-projects.php", function(data) {
        var html = "";
        var id = 0;
        //var projects = data;
        $.each( data, function( key, project ) {
            if (id > 0) {
                html += "<div style='width: 90%; height: 5px; border-top: 1px solid #b2b2b2; margin:0 auto' ></div>";
            }
            html += "<div style=\"position: relative\" class=\"project-cell\" id=\"project-cell-id-" + id + "\" ondblclick=\"selectProject('" + project.File + "');\">";
            html += "	<div style='display:inline-block;vertical-align:middle; width: 40px'><img src='images/project-file.png' /></div>";
            html += "	<div id='project-cell-name-id-" + id + "' style='display:inline-block;vertical-align:middle; font-size: 12px; z-index:3'>";
            html += "		<div><b>Name:</b> " + project.Name + "</div>";
            html += "		<div><b>Description:</b> " + project.Description.substr(0, 30) + ((project.Description.length > 30) ? "..." : "") + "</div>";
            html += "	</div>";
            html += "	<div style=\"position: absolute; top: 3px; right: 3px; width: 32px\" onclick=\"deleteProject('" + project.File + "');\"><img src=\"images/trash-red-icon.png\" /></div>";            
            html += "</div>";
            html += "<div style='height: 5px'></div>"; // Spacer
            id++;
        });
        $("#load-project-list").html(html);
    });                
}

function selectProject(file)
{
    var postData = {filename: file};
    $.post("load-device-project.php", postData)
        .done(function( data ) {
            if (data != "NONE")
            {
                LoadFile(data, file);
                $("#load-dialog-modal" ).dialog("close");           
            }
        });
}

function deleteProject(file)
{
    $( "#dialog-confirm" ).dialog({
        title: "Delete Project",
        autoOpen: true,
        buttons: {
            "Delete": function() {
                var postData = {filename: file};
                $.post("delete-device-project.php", postData)
                    .done(function( data ) {
                        if (data != "NONE")
                        {
                            GetDeviceProjectList();
                        }
                    });                      
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }     
        }
    });
}

function beautify(source) {
	if (beautify_in_progress) return;
	beautify_in_progress = true;

	var opts = {
		indent_size: 4,
		indent_char: " ",
		preserve_newlines: true,
		brace_style: "collapse",
		keep_array_indentation: false,
		space_after_anon_function:true,
		space_before_conditional: false,
		unescape_strings: false
	};

	var output;
	output = js_beautify(source, opts);
	beautify_in_progress = false;
	return output;
}

jsPlumb.ready(function() {
    

    jsPlumb.bind("jsPlumbConnection", function(conn, originalEvent) { 
        if (disableObjectCounter == false) {
            var uniqeConnectionId = conn.sourceEndpoint.getUuid() + conn.targetEndpoint.getUuid();
            if (conn.targetId.toLowerCase().indexOf("board") == -1) // Connection on the working-area
			{
                ConnectionsMap[uniqeConnectionId] = new ConnectionObject("working-area", conn.sourceEndpoint.getUuid(), conn.targetEndpoint.getUuid());
                ObjectsMap[conn.sourceId].handleNewOutConnection(conn);
                ObjectsMap[conn.targetId].handleNewInConnection(conn);
				UpdateCode();
			}
			else     // Connection on the device-setup-area
			{               
                // if the user change port, change all the relevant components in the project
                if (swapPortFrom != null)
                {
                    for (var key in ObjectsMap) 
                    {
                        if (typeof ObjectsMap[key].Port != 'undefined' )
                        {
                            if (ObjectsMap[key].Port == swapPortFrom)
                            {
                                ObjectsMap[key].UpdatePort(conn.targetEndpoint.getParameter("port"));
                            }
                        }
                    }
                }
                
                swapPortFrom = null;
                ConnectionsMap[uniqeConnectionId] = new ConnectionObject("device-setup-area", conn.sourceEndpoint.getUuid(), conn.targetEndpoint.getUuid());               
                AddRemoveConnectedObject(conn);
                UpdateToolBox(); 
			}
		}
	});
				
/*                
	jsPlumb.bind("click", function(conn, originalEvent) {
	});	
*/
    
	jsPlumb.bind("jsPlumbConnectionDetached", function(conn, originalEvent) {
        var uniqeConnectionId = conn.sourceEndpoint.getUuid() + conn.targetEndpoint.getUuid();
        // This is a swap event when the user move connection from point A to point B without detach
        if (typeof originalEvent == 'undefined' || originalEvent.type == "drop")
        {
            if (conn.targetId.toLowerCase().indexOf("board") != -1)
            {
                swapPortFrom = conn.targetEndpoint.getParameter("port");
            }
            delete ConnectionsMap[uniqeConnectionId];
            return;
        }
            
        if (conn.targetId.toLowerCase().indexOf("board") == -1)
		{
            ObjectsMap[conn.sourceId].handleDeleteOutConnection(conn);
            ObjectsMap[conn.targetId].handleDeleteInConnection(conn);
            
            if (typeof ObjectsMap[conn.targetId].Variables != 'undefined')
            {
                for (var key in ObjectsMap[conn.targetId].Variables)
                {
                    if (typeof RegisteredValuesMap[ObjectsMap[conn.targetId].Variables[key]] != 'undefined')
                        delete RegisteredValuesMap[ObjectsMap[conn.targetId].Variables[key]];
                }
            }
		}
		else
		{
			AddRemoveConnectedObject(conn, true);
            UpdateToolBox();
		}
		
        // Removing by connection.id is not an option since this value can change when we load the program from file
        delete ConnectionsMap[uniqeConnectionId];
        jsPlumb.detach(conn.connection); 
		if (disableObjectCounter == false) UpdateCode();
	});					
	
    /*
	jsPlumb.bind("connectionDrag", function(connection) {
	});		
	
	jsPlumb.bind("connectionDragStop", function(connection) {
	});		*/
	
	<?php
    foreach ($_SESSION['objects'] as $key => $obj)
    {
    ?>
    $( "#<?=$obj->Id;?>" ).draggable({
		appendTo: "body",
		helper: "clone"
	});			   
    <?php
    }
    ?>

	$( "#working-area" ).droppable({
		drop: function( event, ui ) {
            // Draw the object to the screen
            
            var id = ui.draggable[0].id.replace("dynamicObject_","");
            
            if (id == "") return; // Probably a floating window or irrelevant object
            
            // This event occurs when we drag the object in the working area
            if (typeof ObjectsMap[id] !== 'undefined') return;
            
            // Clone the object
            var obj;
            if (typeof ConnectedObjectsMap[id] === 'undefined')
            {
                // If the object is not in the connected objects map it probably functional or logical object
                obj = new  window["Object" + id];
            }
            else
            {
                obj = jQuery.extend(true, {}, ConnectedObjectsMap[id]);
                obj.Position = jQuery.extend(true, {}, ConnectedObjectsMap[id].Position);
                if (typeof obj.Connection !== 'undefined')
                    obj.Connection = null;

            }
            obj.SetupMode = false;
            var objId = obj.Draw(ui.offset);
            ObjectsMap[objId] = obj;
            if (typeof ObjectsMap[objId].AfterDraw === 'function')
            {
                ObjectsMap[objId].AfterDraw();
            }            
		}
	});
	
	$( "#device-setup-area" ).droppable({
		drop: function( event, ui ) {
			switch(ui.draggable[0].id) {
                <?php
                foreach ($_SESSION['objects'] as $key => $obj)
                {
                ?>
                case "<?=$obj->Id;?>":
					var obj = new Object<?=$obj->Id;?>(<?=$obj->Defaults;?>);
					obj.SetupMode = true;
					var objId = obj.Draw(ui.offset, 'device-setup-area');
                    ObjectsOnSetupAreaMap[objId] = obj;
                    if (typeof ObjectsOnSetupAreaMap[objId].AfterDraw === 'function')
                    {
                        ObjectsOnSetupAreaMap[objId].AfterDraw();
                    }
					break;							
                <?php
                }
                ?>
			}
		}
	});		
	var oMain = new ObjectMain();
	ObjectsMap[oMain.Draw({top: 200, left: 280})] = oMain;
	
	var oBoard = new ObjectBoard();
    ObjectsOnSetupAreaMap[oBoard.Draw({top: ($("#device-setup-area").height() / 2) , left: ($("#device-setup-area").width() / 2)}, 'device-setup-area')] = oBoard;
});		 

// Draw the entire ObjectsMap when we load a new project
function RecursiveDraw(Id, objectsMap) {
    for (var key in objectsMap[Id].Chain) {
        if (objectsMap[Id].Chain[key] != null) RecursiveDraw(objectsMap[Id].Chain[key], objectsMap);
    }    
    objectsMap[Id].Draw({top: objectsMap[Id].Position.Y, left: objectsMap[Id].Position.X});
}

function SetProtos(Id, map) {
    map[Id].__proto__ = window["Object" + map[Id].Name].prototype;
}

function ChangePanel(show) {
	var working_area_left = 0;
	var panel_left = 0;

	if (show == true) {
		working_area_left = 180;
		panel_left = 0;
	}else if (show == false) {
		working_area_left = 0;
		panel_left = -180;	
	}

	$("#PropertiesPanel").animate({ bottom: panel_left });
	$("#working-area").animate({
		bottom: working_area_left
	});		
}