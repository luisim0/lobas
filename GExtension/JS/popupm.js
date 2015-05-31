//SAT URLs
var iqaccess_url = "https://cfdiau.sat.gob.mx/nidp/app?";
var weird_sat_login = "https://cfdiau.sat.gob.mx/nidp/lofc.jsp";
var valid_sat_login = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon&sid=0&option=credential&sid=0";
var logged_sat_url = "https://portalcfdi.facturaelectronica.sat.gob.mx/";
var valid_sat_token = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon";

//Global Vars
var wait_url = chrome.extension.getURL("/SrcHTML/wait.html");
var loading_gif = chrome.extension.getURL("IMGs/loading.gif");
var login_url = chrome.extension.getURL("/SrcHTML/loginform.html");
var fapp_logo = chrome.extension.getURL("IMGs/facturapp_logo.png");
var links_url = chrome.extension.getURL("/SrcHTML/quicklinks.html");
var icon_in = chrome.extension.getURL("Icons/icon48.png");
var icon_out = chrome.extension.getURL("Icons/logout48.png");
var retain_rfc = "";//This could read from chrome storage as a default value...
chrome.storage.sync.get("RFC",function(data){
	retain_rfc = data["RFC"];
});

//Functions
function call_wait(){
	//Wait phase
	var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"","data":[]}');
	jsoned.url = wait_url;
	chrome.extension.sendMessage(jsoned,function(response){
		document.body.innerHTML = response.answer.replace(/[\r\n\t]/g, "");
		document.getElementById("fapp_ext_wait_image").src = loading_gif;
	});
}

function call_page(login_code){
	//Wait phase
	var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"","data":[]}');
	jsoned.url = wait_url;
	chrome.extension.sendMessage(jsoned,function(response){
		document.body.innerHTML = response.answer.replace(/[\r\n\t]/g, "");
		document.getElementById("fapp_ext_wait_image").src = loading_gif;
		//Ask for page
		is_session_active(login_code);
	});
}

function getInTouch(){//Send the form without using submit traditional way
	call_wait();
	
	var jsoned = JSON.parse('{"action":"get_php","method":"POST","url":"http://facturapp.eu.pn/PHP/login.php","data":[{"name":"Username","value":""},{"name":"Password","value":""}]}');
	var usname = document.getElementsByName("Username")[0].value;
	var uspass = document.getElementsByName("Password")[0].value;
	
	retain_rfc = usname;
	jsoned.data[0].value = usname;
	jsoned.data[1].value = uspass;
	
	chrome.extension.sendMessage(jsoned,function(response){
		if(response.answer == 'Error'){
			alert("Los servidores de Facturapp están temporalmente fuera de servicio. Por favor intente más tarde.");
			window.close();
		}else{
			var status = response.answer.split("_");
			var code = status[1];
			var status = status[0];
			if(status == 'Scs'){//Success: logged
				var save = {}; save["RFC"] = usname;
				chrome.storage.sync.set(save);
				chrome.tabs.query({},function(tabs){
					var n = tabs.length;
					for(i = 0;i < n;i++){
						(tabs[i].url.indexOf(valid_sat_token) == 0) ? chrome.tabs.update(tabs[i].id,{url:tabs[i].url}) : null;
					}
					focus_sat_page();
				});
			}else if(status == 'Err'){//Known error
				call_page(parseInt(code));
			}else{//Server is answering shit
				alert("Las respuestas del servidor no están procesándose adecuadamente. Por favor póngase en contacto con Facturapp para corregir este error");
				call_page(0);
			}
		}
	});
}

function focus_sat_page(){
	chrome.tabs.query({},function(tabs){
		var n = tabs.length;var pagefound = false;
		for(i = 0;i < n;i++){
			if(tabs[i].url.indexOf(valid_sat_token) == 0){
				pagefound = true;
				chrome.tabs.update(tabs[i].id,{active:true});
			}
		}
		(!pagefound) ? chrome.tabs.create({url:valid_sat_login}) : null;
		window.close(); 
	});
}

function login_text_check(usname, uspass){
	if(usname.value != "" && uspass.value != ""){
		getInTouch();
	}else if(usname.value == ""){
		usname.placeholder= "Escriba su RFC";
		usname.focus();
	}else if(uspass.value == ""){
		uspass.placeholder= "Escriba su Password";
		uspass.focus();
	}
}

function add_login_listeners(usname, uspass){
	//Add listeners
	document.getElementById("fapp_ext_login").addEventListener('click',function(){
		login_text_check(usname, uspass);
	});
	document.getElementById("fapp_ext_signin").addEventListener('click',function(){
		alert("Actualmente en desarrollo   ;)");
	});
	usname.addEventListener('keypress',function(e){
		if(e.keyCode == 13){
			login_text_check(usname, uspass);
		}
		if(this.style.borderColor != ""){
			this.style.borderColor = "";
		}
	});
	uspass.addEventListener('keypress',function(e){
		if(e.keyCode == 13){
			login_text_check(usname, uspass);
		}
		if(this.style.borderColor != ""){
			this.style.borderColor = "";
		}
	});
}

function login_error_handling(usname, uspass, login_code){
	switch(parseInt(login_code)){
		case 0:
			break;
		case 2:
			usname.value = "";
			uspass.value = "";
			usname.style.borderColor = "red";
			usname.focus();
			break;
		case 3:
			usname.value = retain_rfc;
			uspass.value = "";
			uspass.style.borderColor = "red";
			uspass.focus();
			break;
		default:
			usname.value = "";
			usname.foucs();
			uspass.value = "";
			var jsoned = JSON.parse('{"action":"get_error","code":""}');
			jsoned.code = String(login_code);
			chrome.extension.sendMessage(jsoned,function(response){
				alert(response.answer);
			});
	}
}

function is_session_active(login_code){
	var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/PHP/isLogged.php","data":[]}');
	chrome.extension.sendMessage(jsoned,function(response){
		if(response.answer == 'Error'){
			alert("Los servidores de Facturapp están temporalmente fuera de servicio. Por favor intente más tarde.");
			window.close();
		}else{
			var yesno = response.answer.split("_")[1];
			if(yesno == "0"){//There is no previous session
				var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"","data":[]}');
				jsoned.url = login_url;
				chrome.extension.sendMessage(jsoned,function(response){
					//Change body
					document.body.innerHTML = response.answer.replace(/[\r\n\t]/g, "");
					var usname = document.getElementsByName("Username")[0];
					var uspass = document.getElementsByName("Password")[0];
					usname.style.fontFamily = 'Arial';
					if(retain_rfc != undefined){uspass.focus();usname.value = retain_rfc;}else{usname.focus();}
					
					//Place images
					document.getElementById("fapp_ext_logo").src = fapp_logo;
				  	
				  	//Add listeners
				  	add_login_listeners(usname, uspass);
				  	
				  	//Edit on error code
					login_error_handling(usname, uspass, login_code);
				});
			}else{//There is already a session
				login_page = links_url;
				var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"","data":[]}');
				jsoned.url = login_page;
				chrome.extension.sendMessage(jsoned,function(response){
					//Change body
					document.body.innerHTML = response.answer.replace(/[\r\n\t]/g, "");
					
					//Place images
					document.getElementById("fapp_ext_link_sat").src = icon_in;
					document.getElementById("fapp_ext_link_logout").src = icon_out;
					
					//Listeners if links
  					document.getElementById("fapp_ext_gotosat").addEventListener('click', function(){
  						focus_sat_page();
  					});
  					document.getElementById("fapp_ext_gotohell").addEventListener('click', function(){
  						var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/PHP/logout.php","data":[]}');
						chrome.extension.sendMessage(jsoned,function(response){
							if(response.answer == 'Error'){
								alert("La sesión no pudo finalizar. Cierre el explorador para salir de la sesión manualmente.");
							}else{
								//Reload to kill sidebar
								chrome.tabs.query({},function(tabs){
									var n = tabs.length;
									for(i = 0;i < n;i++){
										(tabs[i].url.indexOf(valid_sat_token) == 0) ? chrome.tabs.update(tabs[i].id,{url:tabs[i].url}) : null;
									}
									window.close();
								});
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
	call_page(0);
});