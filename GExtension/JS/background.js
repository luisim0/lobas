var icon_in = chrome.extension.getURL("Icons/icon128.png");
var fenix = null;
var trigger = false;
var oldOpt = null;

chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
	if(message.action == 'get_php'){
		var req = new XMLHttpRequest();
		
		//Listeners
		req.onload = function(){sendResponse({answer:req.responseText});};
		req.onerror = function(){sendResponse({answer:'Error'});};
		
		//Message
		var method = message.method;
		var resdata = "";
		for(i = 0; i < message.data.length; i++){
			resdata = resdata + message.data[i].name + "=" + message.data[i].value + "&"; 
		}
		resdata = resdata.substring(0, resdata.length - 1);//Remove the last &
		
		if(method == "GET"){
			req.open("GET", message.url + "?" + resdata, true);
			req.send();
		}else if(method == "POST"){
			req.open("POST", message.url, true);
			req.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");
			req.send(resdata);
		}
		
		return true;
	}else if(message.action == 'get_error'){
		switch(parseInt(message.code)){
			case 1:
				sendResponse({answer:"Hay un error en su cuenta: ¡No tiene clientes asignados! Por favor póngase en contacto con Facturapp para solucionarlo"});
				break;
			case 2:
				sendResponse({answer:"El RFC no está registrado como usuario de Facturapp"});
				break;
			case 3:
				sendResponse({answer:"Su password es incorrecto"});
				break;
			case 4:
				sendResponse({answer:"No existe el cliente que se buscó"});
				break;
			case 5:
				sendResponse({answer:"Su sesión ha caducado. Por favor inicie sesión nuevamente"});
				break;
			case 6:
				sendResponse({answer:"No ha registrado un password para este cliente o no ha sido posible recuperarlo. Registre un password o inténtelo más tarde"});
				break;
			case 7:
				sendResponse({answer:"El cliente que ha intentado registrar ya se encuentra en su lista de clientes"});
				break;
			default:
				sendResponse({answer:"Código de error no reconocido"});
				break;
		}
	}else if(message.action == 'prompt_message'){
		var opt = {
		  type: "basic",
		  title: message.title,
		  message: message.msg,
		  iconUrl: icon_in
		};
		chrome.notifications.create(opt);
	}else if(message.action == 'show_progress'){
		var opt = {
			type: "progress",
			title: message.title,
			message: message.msg,
			iconUrl: icon_in,
			progress: message.progress,
		};
		oldOpt = opt;
		if(message.progress == 0){
			chrome.notifications.create(opt,function(id){
				chrome.storage.local.set({progid:id},function(){
					if(fenix) clearInterval(fenix);
					fenix = setInterval(function(){
						chrome.notifications.create(oldOpt,function(id){
							chrome.storage.local.set({progid:id});
						});
					},8100);//Notifications last about this amount of ms
				});
			});
		}else{
			chrome.storage.local.get("progid",function(data){
				chrome.notifications.update(data["progid"],opt);
				if(message.progress == 100){if(fenix) clearInterval(fenix);}
			});
		}
	}
});
