<?php
    //header('Content-Type:text/plain; charset=ISO-8859-1');
    include_once("settings.php");
?>
<script type='text/javascript' src='js/jquery-1.10.2.min.js'></script>
<script type='text/javascript' src='js/program-globals.js'></script>
<script type='text/javascript' src='js/functions.js'></script>
<?php  
    
    if (file_exists ($SourceDir."lock.lock"))
    {
        echo "<script>window.parent.showNotification('Error: Another process is already uploading');</script>";
        echo "<script>window.parent.AddClickToBurnButton();</script>";        
        exit(0);
    }


	$code = $_POST["txt-program-code"];
	$myFile = "/var/pepino/sketch/project.ino";
	$fh = fopen($myFile, 'w') or die("can't open file");
	fwrite($fh, $code);
	fclose($fh);	

    

	$cmd = $SourceDir."system-scripts/burn.sh compile-libs.txt 2>&1";
	$descriptorspec = array(
	   0 => array("pipe", "r"),   // stdin is a pipe that the child will read from
	   1 => array("pipe", "w"),   // stdout is a pipe that the child will write to
	   2 => array("pipe", "w")    // stderr is a pipe that the child will write to
	);

	$process = proc_open($cmd, $descriptorspec, $pipes, realpath('./'), array());
	$prosessPhase = 0;
    $msg = "";
    $showMsg = true;
    $animation = "true";
    
    if (is_resource($process)) {
		while ($s = fgets($pipes[1])) {
            echo "<br />";
			flush();
            //file_put_contents($SourceDir."error.log", $s, FILE_APPEND);
            if (stripos($s, "AVR Memory Usage") !== false) 
            {
                $prosessPhase = 1;
                $showMsg = true;
            }
            
            if (stripos($s, "bytes of flash written") !== false) 
            {
                $prosessPhase = 2;
                $showMsg = true;
            }
            
            if (stripos($s, ": error:") !== false)
            {
                $prosessPhase = 3;
                $showMsg = true;                
            }
            
            if ($prosessPhase === 0) { $msg = "Compiling..."; }
            
            if ($prosessPhase == 1)  { $msg = "Uploading..."; }
            
            if ($prosessPhase == 2)  { $msg = "Program uploaded successfully!";}
            
            if ($prosessPhase == 3)  { $msg = "Error: Failed to compile"; }
            
            if ($showMsg)
            {
                echo "<script>window.parent.showNotification('".$msg."', ".$animation.");</script>";
                $showMsg = false;
            }
		}
        echo "<script>window.parent.AddClickToBurnButton();</script>";
	}
?>
