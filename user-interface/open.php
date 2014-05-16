<?php
	$fileName = $fileSize = $fileData = "";
	if (isset($_FILES['myfile'])) {
		$fileName = basename($_FILES['myfile']['name']);
		$fileSize = $_FILES['myfile']['size'];
		$fileData = file_get_contents($_FILES['myfile']['tmp_name']);
	}
	echo $fileData;
?>	 