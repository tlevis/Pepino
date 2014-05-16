<?php 
header('Content-Type: application/json');
include_once("settings.php"); 

class Project {
    var $File;
    var $Name;
    var $Description;
}

function cmpNames($a, $b)
{
	return strcasecmp ($a->Name, $b->Name);
}

$projects = null;


$dirHandle = opendir($SourceDir."/saved-projects");
if ($dirHandle) {
    while (false !== ($SourceFile = readdir($dirHandle))) {
        if ($SourceFile != "." && $SourceFile != "..") {
            $object = @json_decode(file_get_contents($SourceDir."saved-projects/".$SourceFile));
            if ($object)
            {
                $project = new Project();
                $project->File = $SourceFile;
                $project->Name = $object->ProjectName;
                $project->Description = $object->ProjectDescription;
                $projects[] = $project ;
            }
        }
    }
    closedir($dirHandle);
	
    usort($projects, "cmpNames");
    echo json_encode($projects);
}
?>