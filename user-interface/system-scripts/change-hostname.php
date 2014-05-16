<?php
include_once("../settings.php");

if (isset($_REQUEST["data"]))
{
    $data = $_REQUEST["data"];
      
    $oldName = GetSystemSetting("hostname", $database);
    SetSystemSetting("hostname", $data, $database);
    file_put_contents($SourceDir."system-scripts/hostname", $data);
    
    exec("sudo cp ".$SourceDir."system-scripts/hostname /etc/hostname  2>&1");
    exec("sudo sed 's/".$oldName."/".$data."/g' /etc/hosts > ".$SourceDir."system-scripts/hosts  2>&1");
    exec("sudo cp ".$SourceDir."system-scripts/hosts /etc/hosts  2>&1");    
    exec("sudo /etc/init.d/hostname.sh");    

    echo "OK";
}
else
{
    echo " FAIL";
}
?>