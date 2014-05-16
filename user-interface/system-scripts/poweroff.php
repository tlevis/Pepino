<?php
include_once("../settings.php");

if (isset($_REQUEST["type"]))
{
    if ($_REQUEST["type"] == "poweroff")
    {
        exec("sudo poweroff");
    }
    else if ($_REQUEST["type"] == "reboot")
    {
        exec("sudo reboot");
    }
}
?>