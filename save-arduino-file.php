<?php
    include_once("settings.php");
    $filename = "project-".date("y-m-d_H-i-s").".ino";    

    // Set headers
    header("Cache-Control: public");
    header("Content-Description: File Transfer");
    header("Content-Disposition: attachment; filename=".$filename);
    header("Content-Type: application/force-download");
    header("Content-Transfer-Encoding: binary");

    echo $_REQUEST["frm-save-arduino-code"];
?>