<?php
    session_start();
?>
<!doctype html>
<html>
    <head>
    <?php include_once("head.php"); ?>   
    </head>
    
    <body onunload="jsPlumb.unload();">
        <div id="framecontentTop">
            <div style="position: relative; top: 5px">
                <div id="new-project-button" style="position: absolute; top: 12px; left: 10px;"><img title="New Project" alt="New Project" src="images/top-panel/new-icon.png"/></div>
                <div id="load-project-button" style="position: absolute; top: 12px; left: 70px;"><img title="Load Project" alt="Load Project" src="images/top-panel/load-icon.png"/></div>
                <div id="save-project-button" style="position: absolute; top: 12px; left: 130px; "><img src="images/top-panel/save-icon.png" title="Save Project" alt="Save Project" /></div>
                <div id="save-project-as-button" style="position: absolute; top: 12px; left: 190px; "><img src="images/top-panel/save-as-icon.png" title="Save Project As" alt="Save Project As" /></div>
                <div  id="burn-program-button" style="position: absolute; top: 12px; left: 250px;"><img src="images/top-panel/burn-icon.png" "Upload to device" alt="Upload to device"/></div>
                <div id="status-box">
                    <div id="status-project-name"><span>Project Name: </span><span id="status-project-name-value">Untitled</span></div>
                    <div id="status-description"><span>Description: </span><span id="status-description-value"></span></div>
                    <div id="status-notifications">Notifications: <div id="status-notifications-value"></div><div id="notification-cursor">_</div></div>
                </div>
                <div id="toggle-mode" class="design-program-off" style="position: absolute; top: 12px; left: 720px;" ></div>
                <div  style="position: absolute; top: 12px; left: 850px;"><img id="settings-dialog-button" src="images/top-panel/settings-icon.png" title="Settings"  alt="Settings" /></div>
                <div  style="position: absolute; top: 12px; left: 910px;"><img id="show-code-button" src="images/top-panel/code-icon.png"  title="Show Code"  alt="Show Code" /></div>
            </div>
        </div>    
        
        <div id="framecontentLeft">
            <?php
                $workingToolboxCategories = array("Digital", "Analog", "Lego", "Motors", "Logical", "Functional");
                $setupToolboxCategories = array("Digital", "Analog", "Lego", "Motors");
            ?>
            
            <div id="working-toolbox">
                <?php
                    foreach ($workingToolboxCategories as $key => $category)
                    {
                ?>
                <div style="height: 38px; background:url('images/objects-panel/<?=strtolower($category);?>-background.png')"><?=$category;?></div>
                <div class='toolbox-content' id="category<?=$category;?>">
                    <?php
                        foreach ($_SESSION['objects'] as $key => $obj)
                        {
                            // Draw only the objects that cannot be connected in the setup area
                            // The connected objects will be generated in run time
                            if ($obj->Type == $category && ($category == 'Logical' || $category == 'Functional')) 
                            {
                    ?>
                            <div id="<?=$obj->Id;?>" style="display: inline-block; z-index:3"><img src="<?=$obj->ButtonIcon;?>"/></div>
                    <?php
                            }
                        }
                    ?>
                </div>               
                <?php
                    }
                ?>
            </div>
            
            <div id="setup-toolbox">
                <?php
                    foreach ($setupToolboxCategories as $key => $category)
                    {
                ?>
                <div style="height: 38px; background:url('images/objects-panel/<?=strtolower($category);?>-background.png')"><?=$category;?></div>
                <div class='toolbox-content'>
                    <?php
                        foreach ($_SESSION['objects'] as $key => $obj)
                        {
                            if ($obj->Type == $category) 
                            {
                    ?>
                            <div id="<?=$obj->Id;?>" style="display: inline-block; z-index:3"><img src="<?=$obj->ButtonIcon;?>"/></div>
                    <?php
                            }
                        }
                    ?>
                </div>               
                <?php
                    }
                ?>
            </div>            
        </div>        

        <div id="maincontent">
            <div id="working-area">
                <div style="font-size: 30px; font-weight: bold; position: fixed; top: 80px; right: 10px; opacity: 0.2">Design Mode</div>             
            </div>
            <div id="device-setup-area">
                <div style="font-size: 30px; font-weight: bold; position: fixed; top: 80px; right: 10px; opacity: 0.2">Setup Mode</div>
            </div>
			<div>
				<div id="PropertiesPanel">
					<div class="properties-title" onclick="whoIsIt('', active_object_settings);">
                        <span id="object-name"></span> Properties
                        <div style="position: absolute; right: 250px; top: -1px; height: 30px; cursor: pointer" onclick="RemoveObject(active_object_settings);">
                            <img src="images/trash-icon.png" style="vertical-align: middle;"/>
                            <span style="color: white; vertical-align: middle; height:30px;">Delete this object</span>
                        </div>
                    </div>
					<div id="PropertiesPanelContent"></div>
				</div>
			</div>
        </div>   

        <div id="save-dialog-modal" title="Save Project">
            <table>
                <tr>
                    <td valign="top">Project name:</td>
                    <td valign="top"><input type="text" id="save-project-name" /></td>
                </tr>
                <tr>
                    <td valign="top">Project Description:</td>
                    <td valign="top"><input type="text" id="save-project-description" style="width: 300px" /></td>
                </tr>
                <tr>
                    <td valign="top">Save To:</td>
                    <td valign="top">
                        <select type="text" id="save-project-location">
                            <option value="device">Device</option>
                            <option value="file">File</option>
                        </select>
                    </td>
                </tr>
            </table>
            <div align="right" style="padding-top: 10px">
                <button id="save-project-save-button">Save</button>
            </div>
        </div>

        <div id="load-dialog-modal" title="Load Project">
            <table>
                <tr>
                    <td valign="top" colspan="2"><b>On device projects:</b> <span style="font-size: 8px; color: gray">( double click to load )</span></td>
                </tr>
                <tr>
                    <td valign="top">
                        <div style="width: 400px; height: 150px; overflow-y: scroll; overflow-x: hidden; border: 1px solid silver;background-color: white; padding: 5px">
                            <div id="load-project-list" style="width: 380px; "></div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td valign="top" colspan="2">
                        <b>Or</b><br/><br/>
                        <button id="load-project-from-file-button" style="border: 1px solid black">Load from file</button>
                    </td>
                </tr>                
            </table>
        </div>

        <div id="code-view-dialog-modal" title="Program Code (Readonly)">
            <div style="display: block; width: 99%; height: 95%">
                <form id="form-burn-code" action="burn-file.php" method="post" target="hdn_frame" style="display: block; width: 99%; height: 95%">
                    <textarea readonly style="width: 100%; height: 100%; padding: 5px" id="txt-program-code" name="txt-program-code"></textarea>
                </form>
                <div style="padding-top: 15px">
                    <button  id="save-as-arduino-file-button" >Save as Arduino file</button>
                </div>                
            </div>
        </div>
        
        <div id="settings-dialog-modal" title="Settings">
            <table>
                <tr>
                    <td valign="top">
                        <table cellpadding="2">
                            <tr>
                                <td><b>Device name:</b></td>
                                <td><input type="text" id="settings-device-name" style="width: 200px" /></td>
                            </tr>
                            <tr>
                                <td><b>Autosave every:</b></td>
                                <td>
                                    <select id="settings-autosave">
                                        <option value="2">2 Min</option>
                                        <option value="5">5 Min</option>
                                        <option value="10">10 Min</option>
                                        <option value="15">15 Min</option>
                                        <option value="0">Never</option>                            
                                    </select>
                                    <button onclick="removeAutosave();">Clean</button>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <fieldset id="settings-network-group">
                                        <legend><b>Network</b></legend>
                                        <div style="padding-bottom: 5px;"><b>Connected to wifi network:</b> <span id="settings-conncted-wifi"></span></div>
                                        <div style="padding-bottom: 5px;"><b>Ethernet IP:</b> <span id="settings-ethernet-ip"></span></div>
                                        <div style="padding-bottom: 5px;"><b>Wifi IP:</b> <span id="settings-wifi-ip"></span></div>
                                        <div style="padding-bottom: 3px"><b>Available wifi networks:</b></div>
                                        <div style="width: 300px; height: 150px; overflow-y: scroll; overflow-x: hidden; border: 1px solid silver;background-color: white; padding: 5px">
                                            <div id="wifi-list" style="width: 280px; "></div>
                                        </div>
                                    </fieldset>                            
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td style="border-right: 1px solid silver">&nbsp;</td>
                    <td valign="top" style="padding-left: 10px;">
                        <div style="height: 30px"><b>Actions:</b></div>
                        <div style="width: 200px">
                            <table style="width: 100%">
                                <tr>
                                    <td style="width: 100px" align="center">
                                        <div><img id="settings-reboot-button" style="cursor: pointer" src="images/reboot.png"></div>
                                        <div>Reboot</div>
                                    </td>
                                    <td style="width: 100px" align="center">
                                        <div><img id="settings-poweroff-button" style="cursor: pointer" src="images/power-off.png"></div>
                                        <div>Poweroff</div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                    </td>
                </tr>
            </table>
            <div>
                <button id="settings-save-button">Save</button>
            </div>
            
            <div id="settings-dialog-connecting-modal" style="vertical-align:middle;">
                <div style="display:inline-block;vertical-align:middle;"><img src="images/ajax-loader.gif"></div>
                <div style="display:inline-block;vertical-align:middle;">Connecting...</div>
            </div>
            
            <div id="dialog-confirm" title="Empty the recycle bin?">
              <p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>Are you sure?</p>
            </div>            
        </div>
        
        <div style="height: 400px; width: 400px" id="select-result"></div>
        
        

        <script>
        
            $(function() {
               // General GUI
                // ===========                
               
                $( "#setup-toolbox" ).accordion({
                    icons: null,
                    heightStyle: "content"  // Set the cell height to according to its content
                });
               
                
                $( "#working-toolbox" ).accordion({
                    icons: null,
                    heightStyle: "content"  // Set the cell height to according to its content
                });
                
                $( "#working-toolbox" ).hide();
                $( "#working-area" ).hide();
                
                
                $('#toggle-mode').click(function(){
                    $(this).toggleClass("design-program-off");
                    $(this).toggleClass("design-program-on");
                    ChangePanel(false);
                    ToggleMain();
                });            
                
                function ToggleMain()
                {
                    $( "#working-area" ).toggle();
                    $( "#device-setup-area" ).slideToggle("fast");
                    
                    if ($("#working-area").is(":visible") == true)
                    {
                        $( "#working-toolbox" ).show();
                        $( "#setup-toolbox" ).hide();
                    }
                    else
                    {
                        $( "#working-toolbox" ).hide();
                        $( "#setup-toolbox" ).show();
                    }
                }

                $( "#working-area" ).click(function(e){
                    if ($(e.target).is("#working-area"))
                    {
                        active_object_settings = "";
                        ChangePanel(false);
                    }
                });
                
                $("#save-as-arduino-file-button").button().click(function( event ) 
                { 
                    $("#frm-save-arduino-code").val($("#txt-program-code").val());
                    document.getElementById("frm_save_arduino").submit();        
                });                           
                

                
                // Save Project 
                // ============

                $( "#save-dialog-modal" ).dialog({
                      autoOpen: false,
                      width: 'auto',
                      height: 'auto',
                      resizable: false,
                      modal: true
                });
                
                // The button in the save dialog
                $("#save-project-save-button").button().click(function( event ) { SaveProject();}); 

                $("#save-project-as-button").click(function() {
                    $("#save-dialog-modal" ).dialog( "open" );
                });
                
                if (autosaveInterval > 0)
                {
                    autosaveTimer = window.setInterval("SaveProject(true)", autosaveInterval);
                }               

                $("#save-project-button").click(function() {
                    if (currentActiveProject.Filename == null || currentActiveProject.Filename == "")
                    {
                        $("#save-dialog-modal" ).dialog( "open" );
                    }
                    else
                    {
                        SaveProject(false, true);
                    }
                });

                // Load Project
                // ============

                $( "#load-dialog-modal" ).dialog({
                      autoOpen: false,
                      width: 'auto',
                      height: 'auto',
                      resizable: false,
                      modal: true
                });
                
                $("#load-project-button").click(function() {
                    GetDeviceProjectList();
                    $("#load-dialog-modal" ).dialog( "open" );
                    
                    // Workaround for AjaxUpload button init problem
                    $("#load-project-from-file-button").focus();
                    $("#load-project-from-file-button").blur();
                });
                
                // load autosaved project (is available)
                $.get('load-device-project.php', function(data)
                {
                    if (data != "NONE")
                        LoadFile(data);
                });
                
                
                new AjaxUpload('load-project-from-file-button',{
                    action: 'open.php', 
                    name: 'myfile',
                    onSubmit : function(file, ext){
                        this.disable();
                        showNotification("Loading...");
                    },
                    onComplete: function(file, response){
                        this.enable();
                        LoadFile(response);
                        $("#load-dialog-modal" ).dialog("close");
                    }
                });

                
                
                // Settings
                // ========
                
                LoadSettings();
                
                $( "#settings-dialog-modal" ).dialog({
                      autoOpen: false,
                      width: 'auto',
                      height: 'auto',
                      resizable: false,
                      modal: true
                });
                
                $( "#settings-dialog-connecting-modal" ).dialog({
                      autoOpen: false,
                      width: 'auto',
                      height: 90,
                      dialogClass: 'no-close',
                      closeOnEscape: false,
                      resizable: false,
                      modal: true
                });   
                
                $("#settings-dialog-button").click(function() {
                    $("#settings-dialog-modal" ).dialog( "open" );
                    LoadSettings();
                });
                
                $("#settings-save-button").button().click(function( event ) { SaveSettings();});                
                
                $("#settings-reboot-button").click(function(event) {
                    
                    $( "#dialog-confirm" ).dialog({
                        title: "Reboot",
                        autoOpen: true,
                        buttons: {
                            "Reboot": function() {
                                var postData = {type: "reboot"};
                                $.post("system-scripts/poweroff.php", postData)                           
                                $( this ).dialog( "close" );
                                window.location.href = "reboot-message.php";
                            },
                            Cancel: function() {
                                $( this ).dialog( "close" );
                            }     
                        }
                    });
                });
                
                $("#settings-poweroff-button").click(function(event) {
                    
                    $( "#dialog-confirm" ).dialog({
                        title: "Power off",
                        autoOpen: true,
                        buttons: {
                            "Power off": function() {
                                var postData = {type: "poweroff"};
                                $.post("system-scripts/poweroff.php", postData)
                                $( this ).dialog( "close" );
                            },
                            Cancel: function() {
                                $( this ).dialog( "close" );
                            }     
                        }
                    });                    
                });       
                
                
                // Show Code
                // ============

                $( "#code-view-dialog-modal" ).dialog({
                      autoOpen: false,
                      width: 850,
                      height: 500,
                      modal: true
                });    
                
                $("#show-code-button").click(function() {
                    $("#code-view-dialog-modal" ).dialog( "open" );
                });                
                
                // Misc
                // ============
                               
                $( "#dialog-confirm" ).dialog({
                    autoOpen: false,
                    width: 'auto',
                    resizable: false,
                    modal: true
                });
                
                $("#notification-cursor").blink();
                
                $("#new-project-button").click(function(event) {
                    
                    $( "#dialog-confirm" ).dialog({
                        title: "New program",
                        autoOpen: true,
                        buttons: {
                            "New": function() {
                                $( this ).dialog( "close" );
                                $.post("delete-autosave.php", null);
                                window.location.reload();
                            },
                            Cancel: function() {
                                $( this ).dialog( "close" );
                            }     
                        }
                    });                    
                });                
                

                // Expand all the cells and disable on click collapse
                $('.toolbox-content').slideDown();
                $('.ui-accordion-header').off('click');
            });  

            function RemoveClickFromBurnButton()
            {
                $("#burn-program-button").off('click');            
            }
            
            function AddClickToBurnButton() 
            {
                $("#burn-program-button").click(function(event) {
                    
                    $( "#dialog-confirm" ).dialog({
                        title: "Upload program to device",
                        autoOpen: true,
                        buttons: {
                            "Upload": function() {
                                burnCode();
                                $( this ).dialog( "close" );
                            },
                            Cancel: function() {
                                $( this ).dialog( "close" );
                            }     
                        }
                    });                    
                });
            }
            
            AddClickToBurnButton();
        </script>    
        <form id="frm_save_arduino" method="post" target="hdn_frame" action="save-arduino-file.php">
            <input type="hidden" id="frm-save-arduino-code" name="frm-save-arduino-code" value="" />
        </form>
        <form id="frm_save" method="post" target="hdn_frame" action="save.php">
            <input type="hidden" id="frm-save-overwrite" name="frm-save-overwrite" value="" />
            <input type="hidden" id="frm-save-file-name" name="frm-save-file-name" value="" />
            <input type="hidden" id="frm-save-location" name="frm-save-location" value="" />
            <input type="hidden" id="frm-save-json-obj" name="frm-save-json-obj" value="" />
        </form>        
        <iframe src="" name="hdn_frame" id="hdn_frame" frameborder="0" style="width:0px;height:0px"></iframe>        
    </body>
</html>
