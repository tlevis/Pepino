function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function replaceAll(find, replace, str) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function scaleValue(vlaue,  in_min,  in_max,  out_min,  out_max)
{
    return (vlaue - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function replaceCodeTokens(code, tokens)
{
    for (var i = 0; i < tokens.length; i++)
    {
        code = replaceAll("{$" + i +"}",tokens[i], code);
    }
    return code; 
}

function showNotification(str, animation) {
    if (typeof animation === 'undefined') animation = true;
    
    $("#notification-cursor").hide();
    $('#status-notifications-value').text(str);
    if (animation)
    {
        $('#status-notifications-value').animate( {left: NOTIFICATION_LEFT_IN, opacity: 1.0}, 1000, 'easeOutBounce', function() {
            $(this).delay(2000).animate( {left: NOTIFICATION_LEFT_OUT, opacity:0.0}, 1000, 'swing', function() {$("#notification-cursor").show();});
        });  
    }
}

// Source: http://www.antiyes.com/jquery-blink-plugin
// http://www.antiyes.com/jquery-blink/jquery-blink.js
(function($)
{
        $.fn.blink = function(options)
        {
                var defaults = { delay:500 };
                var options = $.extend(defaults, options);
                
                return this.each(function()
                {
                        var obj = $(this);
                        if (obj.attr("timerid") > 0) return;
                        var timerid=setInterval(function()
                        {
                                if($(obj).css("visibility") == "visible")
                                {
                                        $(obj).css('visibility','hidden');
                                }
                                else
                                {
                                        $(obj).css('visibility','visible');
                                }
                        }, options.delay);
                        obj.attr("timerid", timerid);
                });
        }
        $.fn.unblink = function(options) 
        {
                var defaults = { visible:true };
                var options = $.extend(defaults, options);
                
                return this.each(function() 
                {
                        var obj = $(this);
                        if (obj.attr("timerid") > 0) 
                        {
                                clearInterval(obj.attr("timerid"));
                                obj.attr("timerid", 0);
                                obj.css('visibility', options.visible?'visible':'hidden');
                        }
                });
        }
}(jQuery))


// Show the current connected objects on the toolbox
function UpdateToolBox()
{	
	$("#categoryDigital").empty();
    $("#categoryAnalog").empty();
    $("#categoryLego").empty();
    $("#categoryMotors").empty();

	for (key in ConnectedObjectsMap)
	{
        // add prefix to identify these objects later on
        var newElement = "<div id=\"dynamicObject_" + ConnectedObjectsMap[key].Id + "\" style=\"display: inline-block; z-index:3; position: relative\"><img src=\"objects/" + ConnectedObjectsMap[key].Name + "/images/button.png\";\"/>";
        newElement += "<div class='object-port-block'>" + ConnectedObjectsMap[key].Port + "</div>";
        newElement += "</div>";
        $("#category" + ConnectedObjectsMap[key].Category).append(newElement);
        $( "#dynamicObject_" + ConnectedObjectsMap[key].Id).draggable({
            appendTo: "body",
            helper: "clone"
        });
	}
    $('.toolbox-content').slideDown();
}

function whoIsIt(variable, objId)
{
    
    if (typeof objId == 'undefined')
    {
        for (var key in RegisteredValuesMap)
        {
            if (RegisteredValuesMap[key].VariableName == variable)
            {
                objId = RegisteredValuesMap[key].ObjectId;
                break;
            }
        }
    }
    
    if (objId != "") 
    {
        $("#" + objId).blink({ delay: 300});
        setTimeout("$(\"#" + objId + "\").unblink();", 2000);
    }
}

// This code was taken from:
// http://www.qodo.co.uk/assets/files/javascript-restrict-keyboard-character-input.html
// ------>
var restrictCharactersIntegerOnly = /[0-9\.]/g;
var restrictCharactersDateOnly = /[0-9\.\-]/g;
function restrictCharacters(myfield, e, restrictionType) {
	if (!e) var e = window.event
	if (e.keyCode) code = e.keyCode;
	else if (e.which) code = e.which;
	var character = String.fromCharCode(code);

	// if they pressed esc... remove focus from field...
	if (code==27) { this.blur(); return false; }

	// ignore if they are press other keys
	// strange because code: 39 is the down key AND ' key...
	// and DEL also equals .
	if (!e.ctrlKey && code!=9 && code!=8 && code!=36 && code!=37 && code!=38 && (code!=39 || (code==39 && character=="'")) && code!=40) {
		if (character.match(restrictionType)) {
			return true;
		} else {
			return false;
		}
	}
}
// <------