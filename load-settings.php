<?php
header('Content-Type: application/json');
include_once("settings.php");

if ($database)
{
    $settings = [];
    $sql = "select property_id, value from ".$_SESSION["tablePrefix"]."settings";
    $result = $database->query($sql);
    foreach($result as $row) {
        $settings[$row['property_id']] = $row['value'];
    }
    echo json_encode($settings);
}
?>