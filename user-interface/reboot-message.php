<?php
    session_start();
?>
<!doctype html>
<html>
    <head>
    <?php 
        $minimalHeader = true;
        include_once("head.php"); 
    ?>   
    
    <script>
    $(function() {
        $( "#progressbar" ).progressbar({
            max: 599,
            value: false
        });
        
        var counter = 0;
        var timer = setTimeout(wating(), 100);

        function wating()
        {
            if (counter < 600)
            {
                counter++;
                $("#progressbar").progressbar({ value: counter });
                timer = setTimeout(wating, 100); 
            }
            else
            {
                window.location.href = "/";
            }
        }        
    });
    </script>
    
    </head>
    
    <body>
        <div style="width: 100%;">
            <div style="margin: 0 auto; width: 500px; text-align: center"><img style="height: 500px; width: 500px" src="images/logo.png" /></div>
            <div style="font-size: 50px; font-weight: bold; margin: 0 auto; width: 600px; text-align: center">Please wait...</div>            
            <div id="progressbar" style="margin: 0 auto; width: 600px;"></div>            
        </div>   
    </body>
</html>