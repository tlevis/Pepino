<?php
header('Content-Type: application/json');
class WifiConnection {
	var $Name;
	var $Speed;
	var $Encrypted;
	var $Encryption;	
	var $Signal;
	
	function GetSignalIcon()
	{
		$icon = 0;
		if ($this->Signal >= 0.2 && $this->Signal < 0.4)
		{
			$icon = 1;
		}
		elseif ($this->Signal >= 0.4 && $this->Signal < 0.6)
		{
			$icon = 2;
		}
		elseif ($this->Signal >= 0.6 && $this->Signal < 0.8)
		{
			$icon = 3;
		}
		elseif ($this->Signal >= 0.8 && $this->Signal <= 1)
		{
			$icon = 4;
		}
		return $icon;
	}
}

function cmpSignal($a, $b)
{
	if ($a->Signal == $b->Signal) return 0;
	return ($a->Signal < $b->Signal) ? -1 : 1;
}

function cmpSignalOp($a, $b)
{
	if ($a->Signal == $b->Signal) return 0;
	return ($a->Signal > $b->Signal) ? -1 : 1;
}

$cmd = "sudo iwlist scanning 2>&1";
$descriptorspec = array(
   0 => array("pipe", "r"),   // stdin is a pipe that the child will read from
   1 => array("pipe", "w"),   // stdout is a pipe that the child will write to
   2 => array("pipe", "w")    // stderr is a pipe that the child will write to
);
ob_implicit_flush(true);	
$process = proc_open($cmd, $descriptorspec, $pipes, realpath('./'), array());

if (is_resource($process)) {
	$networks = null;
	$last_network = "";
	while ($s = fgets($pipes[1])) 
	{
		// Wireless network name
		if (strpos(strtolower(trim($s)), "essid:") !== false) 
		{
			$tmp = str_replace("ESSID:", "", trim($s));
			$tmp = str_replace("\"", "", $tmp);
			$last_network = $tmp;
			$networks[$last_network] = new WifiConnection();
			$networks[$last_network]->Name = $last_network;
		}
		
		// Detect if it has an encryption
		if (strpos(strtolower(trim($s)), "encryption key:") !== false) 
		{
			$tmp = str_replace("Encryption key:", "", trim($s));
			$networks[$last_network]->Encrypted = ($tmp == "on");
		}
		
		// Get the encryption type
		if (strpos(strtolower(trim($s)), "ie:") !== false) 
		{
			$tmp = str_replace("IE:", "", trim($s));
			if (strpos(strtolower($tmp), "unknown") === false)
			{
				$networks[$last_network]->Encryption[] = $tmp;
			}
		}
		
		// Get the network speed
		if (strpos(strtolower(trim($s)), "bit rates:") !== false) 
		{
			$tmp = str_replace("Bit Rates:", "", trim($s));
			$networks[$last_network]->Speed = $tmp;
		}		
		
		// Get the signal strength
		if (strpos(strtolower(trim($s)), "quality") !== false) 
		{
			$tmp = explode("=", trim($s));
			$nums = explode("/",$tmp[2]);
			$networks[$last_network]->Signal = floatval($nums[0]) / floatval($nums[1]);
		}			
	}
	
	usort($networks, "cmpSignalOp");
    echo json_encode($networks);
}
?>