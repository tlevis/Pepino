<?php
    include_once("settings.php");
    $filePath = "autosaves/autosave.prj";
    if (isset($_REQUEST["filename"]))
    {
        $filePath = "saved-projects/".$_REQUEST["filename"];
    }
    $bytes = @readfile($filePath);
    if ($bytes === false)
        echo "NONE";
?>