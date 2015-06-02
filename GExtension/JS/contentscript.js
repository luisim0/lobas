//SAT URLs
var iqaccess_url = "https://cfdiau.sat.gob.mx/nidp/app?";
var weird_sat_login = "https://cfdiau.sat.gob.mx/nidp/lofc.jsp";//Cuando termina la sesión
var valid_sat_login = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon";
var logged_sat_url = "https://portalcfdi.facturaelectronica.sat.gob.mx/";
var valid_sat_token = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon";

//Globals
const hide_unnactive_URL = chrome.extension.getURL("IMGs/hide_unnactive.png");
const sidebar_URL = chrome.extension.getURL("/SrcHTML/sidebar.html");
const client_box = chrome.extension.getURL("/SrcHTML/client_box.html");
const popup_box = chrome.extension.getURL("/SrcHTML/client_input.html");
const hide_active_URL = chrome.extension.getURL("IMGs/hide_active.png");
const status_ready = chrome.extension.getURL("IMGs/ready.png");
const status_loading = chrome.extension.getURL("IMGs/loading.gif");
const status_wrong = chrome.extension.getURL("IMGs/wrong.png");
const fapp_logo = chrome.extension.getURL("IMGs/facturapp_logo_ver.png");
const office_generic = chrome.extension.getURL("IMGs/edificio.png");
var json_arr;
var prev_search = "";
var sel_index = 0;
const clientY = 55;//How much the panel must scroll per client
var acumY = 0;//The actual position of highlighted element

//Functions
function build_menu(){
	var get_side_bar = new XMLHttpRequest();
	get_side_bar.open("GET", sidebar_URL, true);
	get_side_bar.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	get_side_bar.onload = function(argument){
		var menu = document.createElement('div');
		menu.id = 'fapp_main_panel';
		menu.innerHTML = get_side_bar.responseText.replace(/[\r\n\t]/g, "");
		
		//Insert structure
		document.body.appendChild(menu);
		chrome.storage.sync.get("RFC",function(data){
			document.getElementsByClassName("fapp_office_RFC")[0].innerHTML = data["RFC"];
		});
		
		//Place/edit images		
		var status_image = document.getElementById("fapp_status");
		status_image.src = status_ready;
		document.getElementById("fapp_logo").src = fapp_logo;
		
		//Change status loading
		status_image.src = status_loading;
		
		//Insert Clients
		var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/PHP/getClients.php","data":[]}');
		chrome.extension.sendMessage(jsoned,function(response){//Obtenemos clientes
			if(response.answer == 'Error'){
				status_image.src = status_wrong;
				alert("No se ha procesado correctamente la respuesta del servidor, por favor refresce la página para intentarlo de nuevo.");
			}else{
				json_arr = JSON.parse(response.answer);
				document.getElementById("fapp_num_clients").innerHTML = json_arr.length;
				jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"","data":[]}'); jsoned.url = client_box;
				chrome.extension.sendMessage(jsoned,function(response){//Obtenemos template para el contenedor
					if(response.answer == 'Error'){
						alert("No se ha procesado correctamente la respuesta de la extensión, por favor refresce la página para intentarlo de nuevo.");
						status_image.src = status_wrong;
					}else{
						var n = json_arr.length;
						var client_data = document.getElementById("fdc1");
						for(i = 0;i < n;i++){
							var par_div = document.createElement("div");
							par_div.className = "fapp_client_box fapp_client_normal"; par_div.id = json_arr[i].id;
							par_div.innerHTML = response.answer.replace(/[\r\n\t]/g, "");
							par_div.getElementsByClassName("fapp_client_name_holder")[0].innerHTML = json_arr[i].name;
							par_div.getElementsByClassName("fapp_client_RFC")[0].innerHTML = json_arr[i].rfc;
							client_data.appendChild(par_div);
						}
						add_listeners();
						status_image.src = status_ready;					
					}
				});
			}
		});
	};
	get_side_bar.send();
}

function get_search_results(){
	var clients = document.getElementById("fdc1").children;var n = clients.length;
	var selected = [];
	for(i = 0;i < n;i++){
		var class_parts = clients[i].className.split(" ");
		if(class_parts[1] != "fapp_client_hidden"){
			selected.push(clients[i]);
		}
	}
	return {selected:selected, n:selected.length, class_parts:selected[sel_index].className.split(" ")};
}

function set_selected_num(){
	document.getElementById("fapp_client_count").innerHTML = document.getElementsByClassName("fapp_client_selected").length;
	return true;
}

function add_listeners(){
	//Button to hide/show the sidepanel
	var hide_button = document.getElementById("fapp_hide_holder");
	hide_button.addEventListener('click',function(){
		var main_panel = document.getElementById("fapp_frame_contents"); 
		if (main_panel.className == "fapp_frame_contents"){
			main_panel.className = "fapp_frame_contents_collapsed";
			hide_button.className = "rotate";
		}else{
			main_panel.className = "fapp_frame_contents";
			hide_button.className = "no_rotate";
		}
	});
	
	//Link #of clients (the number in the profile category)
	document.getElementById("fapp_num_clients").addEventListener('click',function(){
		document.getElementById("fapp_cat_1").click();
	});
	
	//Category selectors - I think this must be restated!!
	var cat_links = document.getElementsByClassName("fapp_category_container");
	var n = cat_links.length;
	for(i = 0; i < n; i++){
		cat_links[i].addEventListener('click',function(){
			var i = parseInt(this.id.split("_")[2]);
			var siblings = this.parentNode.children;var n = siblings.length;var del = [];
			for(j = 0; j < n; j++){(siblings[j].className.indexOf("fapp_data_container") == 0) ? del.push(siblings[j]) : null;}
			
			var cat_links = document.getElementsByClassName(this.className);n = cat_links.length;
			var has_menu = [1]; //Add here all categories which has a menu 
			
			for(j = 0; j < n; j++){
				if(j != i){
					(has_menu.indexOf(j) > -1) ? cat_links[j].nextSibling.className = "fapp_menu_hidden" : null;
					del[j].className = "fapp_data_container";
					cat_links[j].firstChild.style.color = "#eaeaea";
					cat_links[j].firstChild.style.cursor = "pointer";
				}else{
					(has_menu.indexOf(j) > -1) ? cat_links[j].nextSibling.className = "fapp_menu_active" : null;
					(has_menu.indexOf(j) > -1) ? del[j].className = "fapp_data_container_wmenu" : del[j].className = "fapp_data_container_populated";
					cat_links[j].firstChild.style.color = "#16495C";
					cat_links[j].firstChild.style.cursor = "default";
				}
			}
		});
	}
	
	//Client selection - recycle above variables - Clients must be loaded at the begining!!!!
	cat_links = document.getElementsByClassName("fapp_client_icon"); n = cat_links.length;
	for(i = 0;i < n;i++){
		cat_links[i].addEventListener('click',function(){
			var class_parts = this.parentNode.className.split(" ");
			(class_parts[0] == "fapp_client_box") ? this.parentNode.className = "fapp_client_selected " + class_parts[1] : this.parentNode.className = "fapp_client_box " + class_parts[1];
			set_selected_num();
		});
	}
	
	//Selection tools - uses the same cat_links variable above!! Select all and none
	document.getElementById("fapp_client_all").addEventListener('click',function(){
		for(i = 0;i < n;i++){
			var class_parts = cat_links[i].parentNode.className.split(" ");
			(class_parts[1] != "fapp_client_hidden") ? cat_links[i].parentNode.className = "fapp_client_selected " + class_parts[1] : null;
		}
		set_selected_num();
	});
	
	document.getElementById("fapp_client_none").addEventListener('click',function(){
		for(i = 0;i < n;i++){
			var class_parts = cat_links[i].parentNode.className.split(" ");
			(class_parts[1] != "fapp_client_hidden") ? cat_links[i].parentNode.className = "fapp_client_box " + class_parts[1] : null;
		}
		set_selected_num();
	});
	
	//Search bar
	var search_event = new CustomEvent("search");
	document.getElementById("fapp_search_input_field").addEventListener('search',function(){
		var n = json_arr.length;
		var strFind = this.value.toLowerCase();
		for(i = 0;i < n;i++){
			var spec_node = document.getElementById(json_arr[i].id);
			var ndclass = spec_node.className.split(" ");
			if(strFind == ""){//Remove hidden from all
				spec_node.className = ndclass[0] + " fapp_client_normal";
			}else{
				if(json_arr[i].name.toLowerCase().indexOf(strFind) != -1){
					spec_node.className = ndclass[0] + " fapp_client_normal"; 
				}else{			
					spec_node.className = ndclass[0] + " fapp_client_hidden";
				}
			}
		}
		
	});
	
	//Search bar tracking changes
	setInterval(function(){
		var bar = document.getElementById("fapp_search_input_field");
		if(bar.value != prev_search){
			bar.dispatchEvent(search_event);
			prev_search = bar.value;
		}
	}, 200);
	
	//Keyboard shortcuts for search bar
	document.getElementById("fapp_search_input_field").addEventListener('keydown',function(e){
		switch(e.keyCode){
			case 13: //Enter
				var res = get_search_results();
				var selected = res.selected;var n = res.n;var class_parts = res.class_parts;
				if(class_parts[1] == "fapp_client_normal"){
					selected[sel_index].className = class_parts[0] + " fapp_client_highlighted"; 
				}else{//If already highlighted
					(class_parts[0] == "fapp_client_box") ? selected[sel_index].className = "fapp_client_selected " + class_parts[1] : selected[sel_index].className = "fapp_client_box " + class_parts[1];
				}
				set_selected_num();
				break;
			case 38: //Up arrow
				var res = get_search_results();
				var selected = res.selected;var n = res.n;var class_parts = res.class_parts;
				var clients_panel = document.getElementById("fdc1");
				if(sel_index > 0 && selected[sel_index].className.split(" ")[1] == "fapp_client_highlighted"){
					selected[sel_index].className = class_parts[0] + " fapp_client_normal";
					sel_index -= 1;
					class_parts = selected[sel_index].className.split(" ");
					selected[sel_index].className = class_parts[0] + " fapp_client_highlighted";
					acumY -= clientY;
				}	
				var ratio = Math.floor(clients_panel.offsetHeight/clientY)*clientY;//Page size
				if(acumY < clients_panel.scrollTop) animate_scroll_up(acumY - ratio + clientY);
				break;
			case 40: //Down arrow
				var res = get_search_results();
				var selected = res.selected;var n = res.n;var class_parts = res.class_parts;
				var clients_panel = document.getElementById("fdc1");
				if(sel_index < n - 1  && selected[sel_index].className.split(" ")[1] == "fapp_client_highlighted"){
					selected[sel_index].className = class_parts[0] + " fapp_client_normal";
					sel_index += 1;
					class_parts = selected[sel_index].className.split(" ");
					selected[sel_index].className = class_parts[0] + " fapp_client_highlighted";
					acumY += clientY;
				}
				var ratio = Math.floor(clients_panel.offsetHeight/clientY)*clientY;//Page size
				if(acumY >= clients_panel.scrollTop + ratio) animate_scroll_down(acumY);
				break;
			default:
				sel_index = 0;
		}
	});
	
	//Client Add edit delete
	document.getElementById("fapp_client_add").addEventListener('click',function(){
		throw_popup('add');
	});
	document.getElementById("fapp_client_edit").addEventListener('click',function(){
		throw_popup('edit');
	});
	document.getElementById("fapp_client_bin").addEventListener('click',function(){
		alert("delete");
	});
}

function animate_scroll_down(ratio){
	var clients_panel = document.getElementById("fdc1");
	setTimeout(function(){
		var old_scroll = clients_panel.scrollTop;var change = true;
		clients_panel.scrollTop += 5;
		if(old_scroll == clients_panel.scrollTop) change = false;
		if(clients_panel.scrollTop < ratio && change) animate_scroll_down(ratio);
	}, 1);
}

function animate_scroll_up(ratio){
	var clients_panel = document.getElementById("fdc1");
	setTimeout(function(){
		var old_scroll = clients_panel.scrollTop;var change = true;
		clients_panel.scrollTop -= 5;
		if(old_scroll == clients_panel.scrollTop) change = false;
		if(clients_panel.scrollTop > ratio && change) animate_scroll_up(ratio);
	}, 1);
}
					
function check_page(){
	if(window.location.href.indexOf(iqaccess_url) == 0){
		//We reached the netiq access manager... :(
		window.location.replace(logged_sat_url);
		return false;
	}else if(window.location.href.indexOf(weird_sat_login) == 0){
		//Ended session
		window.location.replace(valid_sat_login);
		return false;
	}/*else{
		var ind = document.getElementsByClassName("contrasena")[0].getElementsByTagName("a")[0];
		if(ind.innerHTML == "Fiel"){//Good page
			return true;
		}else{//Bad page
			return false;
		}
	}*/
	is_session_active();
	return true;
}

function is_session_active(){
	var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/PHP/isLogged.php","data":[]}');
	chrome.extension.sendMessage(jsoned,function(response){
		if(response.answer == 'Error'){
			alert("Los servidores de Facturapp están temporalmente fuera de servicio. Por favor intente más tarde.");
			//window.close();
			return false;
		}else{
			var yesno = response.answer.split("_")[1];
			if(yesno == "0"){//There's no session
				//instruct to open session
				if(window.location.href.indexOf(valid_sat_token) == 0){
					jsoned = JSON.parse('{"action":"prompt_message"}');
					chrome.extension.sendMessage(jsoned);
				}
				return false;
			}else{//There's session
				build_menu();
				return true;
			}
		}
	});
}

function throw_popup(addedit){
	var black_scrn = document.createElement("div");
	black_scrn.className = "fapp_cover_page";
	
	var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"","data":[]}'); jsoned.url = popup_box;
	chrome.extension.sendMessage(jsoned,function(response){
		if(response.answer == 'Error'){
			alert("No fue posible procesar la información, por favor intente más tarde");
		}else{
			black_scrn.innerHTML = response.answer.replace(/[\r\n\t]/g, "");
			document.body.appendChild(black_scrn);
			//Add handlers
			document.getElementsByClassName("fapp_input_cross")[0].addEventListener('click',function(){
				document.body.removeChild(black_scrn);
			});
			document.getElementsByClassName("fapp_input_check")[0].addEventListener('click',function(){
				var pass = document.getElementById("fapp_input_pass");
				var repass = document.getElementById("fapp_input_repass");
				if(pass.value == repass.value){
					query_client_change(black_scrn);
					document.body.removeChild(black_scrn);
				}else{
					repass.style.backgroundColor = "rgba(255,166,155,0.5)";
				}
			});
			document.getElementById("fapp_input_repass").addEventListener('keypress',function(){
				var repass = document.getElementById("fapp_input_repass");
				repass.style.backgroundColor = "rgba(255,255,255,0.2)";
			});
		}
	});
}

function query_client_change(){
	
}

//Main! - It goes check_page() >> is_session_active() >> build_menu()
check_page();