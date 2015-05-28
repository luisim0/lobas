//Global Vars
var tabid = -1;
var satlink = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon&sid=0&option=credential&sid=0";

//Functions
function call_page(){
	//Wait phase
	var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"","data":[]}');
	jsoned.url = chrome.extension.getURL("/SrcHTML/wait.html");
	chrome.extension.sendMessage(jsoned,function(response){
		document.body.innerHTML = response.answer.replace(/[\r\n\t]/g, "");
		document.getElementById("fapp_ext_wait_image").src = chrome.extension.getURL("IMGs/loading.gif");
		//Ask for page
		is_session_active();
	});
}

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
					
					//Place images
					document.getElementById("fapp_ext_link_sat").src = chrome.extension.getURL("Icons/icon48.png")
					document.getElementById("fapp_ext_link_logout").src = chrome.extension.getURL("Icons/logout48.png")
					
					//Listeners if links
  					document.getElementById("fapp_ext_gotosat").addEventListener('click', function(){
  						chrome.tabs.create({url:satlink});
  						window.close();
  					});
  					document.getElementById("fapp_ext_gotohell").addEventListener('click', function(){
  						var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/PHP/logout.php","data":[]}');
						chrome.extension.sendMessage(jsoned,function(response){
							if(response.answer == 'Error'){
								alert("La sesión no pudo finalizar. Cierre el explorador para salir de la sesión manualmente.");
							}else{
								window.close();
							}
						});
  					});
				});
			}
		}
	});
}

//Event Listeners
document.addEventListener('DOMContentLoaded', function() {
	call_page();
});