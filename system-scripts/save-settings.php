<?php
include_once("../settings.php");

if (isset($_REQUEST["hostname"]))
{
    $hostname = $_REQUEST["hostname"];
      
    $oldName = GetSystemSetting("hostname", $database);
    SetSystemSetting("hostname", $hostname, $database);
    file_put_contents($SourceDir."system-scripts/hostname", $hostname);
    
    exec("sudo cp ".$SourceDir."system-scripts/hostname /etc/hostname  2>&1");
    exec("sudo sed 's/".$oldName."/".$hostname."/g' /etc/hosts > ".$SourceDir."system-scripts/hosts  2>&1");
    exec("sudo cp ".$SourceDir."system-scripts/hosts /etc/hosts  2>&1");    
    exec("sudo /etc/init.d/hostname.sh");    
}

if (isset($_REQUEST["autosave"]))
{
    SetSystemSetting("autosave", $_REQUEST["autosave"], $database);
}
?>