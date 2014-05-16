<?php
    //header('Content-Type:text/plain; charset=ISO-8859-1');
    include_once("settings.php");
    if (isset($_REQUEST["autosave"])) 
    {
        file_put_contents( $SourceDir."autosaves/autosave.prj", $_REQUEST["project"]);    
    }
    else
    {
        $filename = "project-".date("y-m-d_H-i-s").".prj";    
        if ($_REQUEST["frm-save-location"] == "file")
        {
            // Set headers
            header("Cache-Control: public");
            header("Content-Description: File Transfer");
            header("Content-Disposition: attachment; filename=".$filename);
            header("Content-Type: application/force-download");
            header("Content-Transfer-Encoding: binary");

            echo $_REQUEST["frm-save-json-obj"];
        }
        else if ($_REQUEST["frm-save-location"] == "device")
        {
            if (isset($_REQUEST["frm-save-file-name"]))
            {
                if ($_REQUEST["frm-save-file-name"] != "") 
                {
                    $filename = $_REQUEST["frm-save-file-name"];
                }
            }
            file_put_contents( $SourceDir."saved-projects/$filename", $_REQUEST["frm-save-json-obj"]);

            if (isset($_REQUEST["frm-save-overwrite"]))
            {
                if ($_REQUEST["frm-save-overwrite"] == false)
                {
                    echo "<script>window.parent.updateCurrentActiveProjectFilename('".$filename."');</script>";
                }
            }            
        }
        // Remove the autosave after saving
        @unlink( $SourceDir."autosaves/autosave.prj");
    }
?>