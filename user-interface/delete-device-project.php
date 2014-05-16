<?php
    // Very unsafe file.
    // Make more protections in the future
    include_once("settings.php");
    if (isset($_REQUEST["filename"]))
    {
        $filePath = "saved-projects/".$_REQUEST["filename"];
        // Detect attempt to file manipulation 
        if (strpos($_REQUEST["filename"], "..") !== false)
        {
            echo "NONE";
            exit(1);
        }
        unlink( $SourceDir.$filePath);
        echo "DONE";
    }
    else
    {
        echo "NONE";
    }
?>	 