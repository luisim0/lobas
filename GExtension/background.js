chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
	if(message.action == 'get_php'){
		var req = new XMLHttpRequest();
		
		//Listeners
		req.onload = function(){sendResponse({answer:req.responseText});};
		req.onerror = function(){sendResponse({answer:'Error'});};
		
		//Message
		var method = message.method;
		var resdata = "";
		for(single in message.data){
			resdata = resdata + single.name + "=" + single.value + "&";
		}
		resdata = resdata.substring(0, resdata.length - 1);//Remove the last &
		
		if(method == "GET"){
			req.open("GET", message.url + "?" + resdata, true);
			req.send();
		}else if(method == "POST"){
			req.open("POST", message.url, true);
			req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			req.send(resdata);
		}
		
		return true;
	}
});
