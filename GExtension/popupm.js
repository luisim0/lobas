//Global Vars
var tabid = -1;
var satlink = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon&sid=0&option=credential&sid=0";

//Initialize
function main(){
	//Place images
	document.getElementById("fapp_ext_logo").src = chrome.extension.getURL("IMGs/facturapp_logo.png");
}

//Functions
function loadSATPage(e){
	chrome.tabs.create({url:satlink});
}

//Event Listeners
document.addEventListener('DOMContentLoaded', function() {
	//Listeners
  	document.getElementById("open_SAT").addEventListener('click', loadSATPage);
  	document.getElementById("fapp_ext_login").addEventListener('click',function(){
  		var form = document.getElementById("fapp_ext_form");
  		form.submit();
  	});
  	document.getElementById("fapp_ext_signin").addEventListener('click',function(){
  		alert("Actualmente en desarrollo   ;)");
  	});
  	document.getElementById("fapp_ext_pss").addEventListener('keypress',function(e){
  		if(e.keyCode == 13){
  			var form = document.getElementById("fapp_ext_form");
  			form.submit();
  		}
  	});
  	//Initialize
  	main();
});

//Ask for session active
var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/PHP/isLogged.php","data":[]}');
chrome.extension.sendMessage(jsoned,function(response){
	if(response.answer == 'Error'){
		alert("Los servidores de Facturapp están temporalmente fuera de servicio. Por favor intente más tarde.");
		//Guardar en chrome.storage no session
	}else{
		var yesno = response.answer;
		if(yesno == "0"){//There is no previous session
			//Guardar en chrome.storage no session
			//Load login page
			//Remember that the event handler must depend on which paga was loaded
			alert("Must load login page");
		}else{//There is already a session
			//Guardar en chrome.storage sí session
			//Load link page
			//Remember that the event handler must depend on which paga was loaded
			alert("Must load link page");
		}
	}
});