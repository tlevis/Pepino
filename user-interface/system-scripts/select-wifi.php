<?php
include_once("../settings.php");

if (isset($_REQUEST["data"]))
{
    $data = json_decode($_REQUEST["data"]);
    $networkData = "";
    if ($data->Network->Encrypted)
    {
        foreach ($data->Network->Encryption as $key => $value)
        {
            if (stripos($value, "wep") !== false)
            {
                $networkData .= "wireless-essid ".$data->Network->Name."\n";
                $networkData .= "wireless-key ".$data->Password;        
            }
            
            if (stripos($value, "wpa") !== false)
            {
                $networkData .= "wpa-ssid ".$data->Network->Name."\n";
                $networkData .= "wpa-psk ".$data->Password;                    
            }
        }
    }
    else
    {
        $networkData .= "wireless-essid ".$data->Network->Name."\n";
    }
    $content = <<<EOT
auto lo

iface lo inet loopback
iface eth0 inet dhcp

allow-hotplug wlan0
auto wlan0
iface wlan0 inet dhcp
{$networkData}
EOT;

    file_put_contents($SourceDir."system-scripts/interfaces", $content);

    $cmd = "sudo cp ".$SourceDir."system-scripts/interfaces /etc/network/interfaces  2>&1";
    exec($cmd);
    sleep(4);    
    exec("sudo ifdown wlan0 2>&1");
    sleep(4);
    //$result = exec("sudo ifup wlan0 2>&1");
    $descriptorspec = array(
       0 => array("pipe", "r"),   // stdin is a pipe that the child will read from
       1 => array("pipe", "w"),   // stdout is a pipe that the child will write to
       2 => array("pipe", "w")    // stderr is a pipe that the child will write to
    );
    $process = proc_open("sudo ifup wlan0 2>&1", $descriptorspec, $pipes, realpath('./'), array());
	if ($process)
    {
        while ($s = fgets($pipes[1])) 
        {
                if (strpos(strtolower(trim($s)), "socket/fallback") !== false) 
                {
                    //echo "FAIL";
                    //SetSystemSetting("wifi", "", $database);
                    //exit(0);
                }
        }
    }
    SetSystemSetting("wifi", $data->Network->Name, $database);
    echo "OK";    
}
else
{
    echo "FAIL";
    SetSystemSetting("wifi", "", $database);    
}
?>