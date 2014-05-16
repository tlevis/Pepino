<?php
    $SourceDir = "/var/www/";
    $lang = "en"; 

    $_SESSION["tablePrefix"] = "pepino_";
    $database = new PDO('sqlite:'.$SourceDir.'database/db.db');
    
    function SetSystemSetting($key, $value, $db)
    {
        if ($db) 
        {
            $key = SQLite3::escapeString($key);
            $value = SQLite3::escapeString($value);
            $sql = "update ".$_SESSION["tablePrefix"]."settings set value = '".$value."' where property_id = '".$key."'";
            $db->exec($sql);
        }
    }

    function GetSystemSetting($key, $db)
    {
        if ($db)
        {
            $value = "";
            $key = SQLite3::escapeString($key);
            $sql = "select value from ".$_SESSION["tablePrefix"]."settings where property_id = '".$key."'";
            $result = $db->query($sql);
            foreach($result as $row) {
                $value = $row['value'];
                break;
            }
            return $value;
        }
    } 
    ?>