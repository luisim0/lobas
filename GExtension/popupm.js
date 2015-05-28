//Global Vars
var tabid = -1;
var satlink = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon&sid=0&option=credential&sid=0";

//Functions
function is_session_active(){
	var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/PHP/isLogged.php","data":[]}');
	chrome.extension.sendMessage(jsoned,function(response){
		if(response.answer == 'Error'){
			alert("Los servidores de Facturapp están temporalmente fuera de servicio. Por favor intente más tarde.");
			window.close();
		}else{
			var yesno = response.answer;
			var login_page = "";
			if(yesno == "0"){//There is no previous session
				login_page = chrome.extension.getURL("/SrcHTML/loginform.html");
				var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"","data":[]}');
				jsoned.url = login_page;
				chrome.extension.sendMessage(jsoned,function(response){
					//Change body
					document.body.innerHTML = response.answer.replace(/[\r\n\t]/g, "");
					
					//Place images
					document.getElementById("fapp_ext_logo").src = chrome.extension.getURL("IMGs/facturapp_logo.png");
					
					//Add listeners
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
				});
			}else{//There is already a session
				login_page = chrome.extension.getURL("/SrcHTML/quicklinks.html");
				var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"","data":[]}');
				jsoned.url = login_page;
				chrome.extension.sendMessage(jsoned,function(response){
					//Change body
					document.body.innerHTML = response.answer.replace(/[\r\n\t]/g, "");
					
					//Listeners if links
  					document.getElementById("open_SAT").addEventListener('click', function(){
  						chrome.tabs.create({url:satlink});
  					});
				});
			}
		}
	});
}

//Event Listeners
document.addEventListener('DOMContentLoaded', function() {
	//Wait phase
	document.getElementById("fapp_ext_wait_image").src = chrome.extension.getURL("IMGs/loading.gif");
	//Ask for page
	is_session_active();
});