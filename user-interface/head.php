<?php include_once("settings.php"); ?>
        <title>Pepino</title>
        <link rel="stylesheet" href="css/main.css" />
        <link rel="stylesheet" href="css/jquery-ui.css" />
        <link rel="stylesheet" href="css/jquery.contextMenu.css" />        
        <link rel="stylesheet" href="js/themes/base/jquery.ui.slider.css" />
        <link rel="icon"  type="image/png"  href="images/pepino-fav-icon.png" />
        
        <script type='text/javascript' src='js/jquery-1.10.2.min.js'></script>
        <script type='text/javascript' src='js/jquery-ui-1.9.2.custom.min.js'></script> 
        <script type='text/javascript' src='js/jquery.jsPlumb-1.3.10-all-min.js'></script>
        <script type='text/javascript' src='js/jquery.contextMenu.js'></script>
        <script type='text/javascript' src='js/jquery.ui.touch-punch.min.js'></script>

        
        
        <script type='text/javascript' src='js/ajaxupload.3.6.js'></script>
        <script type='text/javascript' src='js/json2.js'></script>
        <script type='text/javascript' src='js/beautify.js'></script>

        <script type='text/javascript' src='js/program-globals.js'></script>	
        <script type='text/javascript' src='js/functions.js'></script>	
<?php if (!isset($minimalHeader)) { ?>
        <script type='text/javascript' src='general-code-libraries/i2c.js'></script>
        <script type='text/javascript' src='objects/objects.js'></script>
	<?php
        $_SESSION['objects'] = array();

        // loop through all the objects in the directory
		$SourceHandle = opendir($SourceDir."objects");
		if ($SourceHandle) {
			while (false !== ($SourceFile = readdir($SourceHandle))) {
				if ($SourceFile != "." && $SourceFile != ".." && $SourceFile != "objects.js") {
                    $object = @json_decode(file_get_contents($SourceDir."objects/".$SourceFile."/object.json"));
                    if ($object)
                    {
                        $object->ButtonIcon = "objects/".$SourceFile."/images/button.png";
                        $_SESSION['objects'][] = $object;
                    }
	?>
            <link rel="stylesheet" href="objects/<?=$SourceFile;?>/<?=$SourceFile;?>.css" />
            <script type='text/javascript' src='objects/<?=$SourceFile;?>/<?=$SourceFile;?>.js'></script>
	<?php
				}
			}
			closedir($SourceHandle);
		}		
	?>
		<script type='text/javascript' src='js/main.php'></script>
<?php } // Minimal Header ?>        
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />    