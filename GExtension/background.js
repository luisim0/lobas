chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
	if(message.action == 'get_php'){
		var req = new XMLHttpRequest();
		
		//Listeners
		req.onload = function(){sendResponse({answer:req.responseText});};
		req.onerror = function(){sendResponse({answer:'Error'});};
		
		//Message
		req.open("GET", "http://facturapp.eu.pn/pruebas.php", true);
		req.send();
		
		//Por si te andas pasando de goloso
		return true;
	}
});
