<?php
header('Content-Type: application/json');
include_once("settings.php");

// -E extended regular expression, -o only matching
$cmd = "ifconfig eth0 | grep -E -o \"(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\" 2>&1";

$result = [];
$descriptorspec = array(
   0 => array("pipe", "r"),   // stdin is a pipe that the child will read from
   1 => array("pipe", "w"),   // stdout is a pipe that the child will write to
   2 => array("pipe", "w")    // stderr is a pipe that the child will write to
);

$process = proc_open($cmd, $descriptorspec, $pipes, realpath('./'), array());
if (is_resource($process)) {
	$s = fgets($pipes[1]);
    $result["ethernet"] = trim($s);
}

$cmd = "ifconfig wlan0 | grep -E -o \"(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\" 2>&1";
$process = proc_open($cmd, $descriptorspec, $pipes, realpath('./'), array());
if (is_resource($process)) {
	$s = fgets($pipes[1]);
    $result["wifi"] = trim($s);
}

echo json_encode($result);
?>