//SAT URLs
const iqaccess_url = "https://cfdiau.sat.gob.mx/nidp/app?";
const weird_sat_login = "https://cfdiau.sat.gob.mx/nidp/lofc.jsp";//Cuando termina la sesión
const valid_sat_login = "https://portalcfdi.facturaelectronica.sat.gob.mx/";
const logged_sat_url = "https://portalcfdi.facturaelectronica.sat.gob.mx/";
const valid_sat_token = "https://cfdiau.sat.gob.mx/nidp/app/login?id=SATUPCFDiCon";

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
const add_client_php = "http://facturapp.eu.pn/PHP/addClient.php";
const edit_client_php = "http://facturapp.eu.pn/PHP/editClient.php";
const del_clients_php = "http://facturapp.eu.pn/PHP/deleteClient.php";
var json_arr;
var prev_search = "";
var sel_index = 0;
const clientY = 55;//How much the panel must scroll per client
var acumY = 0;//The actual position of highlighted element

//Functions
function check_page(){
	if(window.location.href.indexOf(iqaccess_url) == 0){
		//We reached the netiq access manager... :(
		window.location.replace(logged_sat_url);
		return false;
	}else if(window.location.href.indexOf(weird_sat_login) == 0){
		//Ended session
		window.location.replace(valid_sat_login);
		return false;
	}else{
		//Normal entrance
		is_session_active();
		return true;
	}
}

function is_session_active(){
	var jsoned = JSON.parse('{"action":"get_php","method":"GET","url":"http://facturapp.eu.pn/PHP/isLogged.php","data":[]}');
	chrome.extension.sendMessage(jsoned,function(response){
		if(response.answer == 'Error'){
			alert("Los servidores de Facturapp están temporalmente fuera de servicio. Por favor intente más tarde.");
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

function build_menu(){
	var get_side_bar = new XMLHttpRequest();
	get_side_bar.open("GET", sidebar_URL, true);
	get_side_bar.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	get_side_bar.onload = function(argument){
		//Insert structure
		document.body.innerHTML += get_side_bar.responseText.replace(/[\r\n\t]/g, "");
		
		//Save RFC options
		chrome.storage.sync.get("RFC",function(data){
			document.getElementsByClassName("fapp_office_RFC")[0].innerHTML = data["RFC"];
		});
		
		//Place/edit images
		document.getElementById("fapp_logo").src = fapp_logo;
		
		//Insert Clients
		refresh_clients(true);
	};
	get_side_bar.send();
}

function refresh_clients(listeners){
	var status_image = document.getElementById("fapp_status");
	status_image.src = status_loading;
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
					client_data.innerHTML = "";
					for(i = 0;i < n;i++){
						var par_div = document.createElement("div");
						par_div.className = "fapp_client_box fapp_client_normal"; par_div.id = json_arr[i].id;
						par_div.innerHTML = response.answer.replace(/[\r\n\t]/g, "");
						par_div.getElementsByClassName("fapp_client_name_holder")[0].innerHTML = json_arr[i].name;
						par_div.getElementsByClassName("fapp_client_RFC")[0].innerHTML = json_arr[i].rfc;
						client_data.appendChild(par_div);
					}
					if(listeners) add_listeners();
					add_client_listeners();
					set_selected_num();
					document.getElementById("fapp_search_input_field").value = "";
					sel_index = 0; acumY = 0;
					status_image.src = status_ready;					
				}
			});
		}
	});
	return true;
}

function add_client_listeners(){
	//Client selection - Clients must be loaded at the begining!!!!
	var cat_links = document.getElementsByClassName("fapp_client_icon"); n = cat_links.length;
	for(i = 0;i < n;i++){
		cat_links[i].addEventListener('click',function(){
			var class_parts = this.parentNode.className.split(" ");
			(class_parts[0] == "fapp_client_box") ? this.parentNode.className = "fapp_client_selected " + class_parts[1] : this.parentNode.className = "fapp_client_box " + class_parts[1];
			set_selected_num();
		});
	}
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
	
	//Selection tools - Select all and none
	document.getElementById("fapp_client_all").addEventListener('click',function(){
		var cat_links = document.getElementsByClassName("fapp_client_icon"); n = cat_links.length;
		for(i = 0;i < n;i++){
			var class_parts = cat_links[i].parentNode.className.split(" ");
			(class_parts[1] != "fapp_client_hidden") ? cat_links[i].parentNode.className = "fapp_client_selected " + class_parts[1] : null;
		}
		set_selected_num();
	});
	
	document.getElementById("fapp_client_none").addEventListener('click',function(){
		var cat_links = document.getElementsByClassName("fapp_client_icon"); n = cat_links.length;
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
				if(json_arr[i].name.toLowerCase().indexOf(strFind) != -1 || json_arr[i].rfc.toLowerCase().indexOf(strFind) != -1){
					spec_node.className = ndclass[0] + " fapp_client_normal"; 
				}else{			
					spec_node.className = ndclass[0] + " fapp_client_hidden";
				}
			}
		}
		sel_index = 0; acumY = 0;
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
				if(class_parts[1] == "fapp_client_normal"){//If not highlighted
					sel_index = 0; acumY = 0;
					selected[sel_index].className = class_parts[0] + " fapp_client_highlighted";
				}else{//If already highlighted
					(class_parts[0] == "fapp_client_box") ? selected[sel_index].className = "fapp_client_selected " + class_parts[1] : selected[sel_index].className = "fapp_client_box " + class_parts[1];
				}
				set_selected_num();
				var clients_panel = document.getElementById("fdc1");var ratio = Math.floor(clients_panel.offsetHeight/clientY)*clientY;//Page size
				if(acumY < clients_panel.scrollTop) animate_scroll_up(acumY - ratio + clientY);
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
				sel_index = 0; acumY = 0;
		}
	});
	
	//Client Add edit delete
	document.getElementById("fapp_client_add").addEventListener('click',function(e){
		throw_popup('add');
	});
	document.getElementById("fapp_client_edit").addEventListener('click',function(e){
		var clients = set_selected_num();
		if(clients.length == 1){
			throw_popup('edit',clients.items[0]);
		}else{
			alert("Seleccione un solo usuario por favor");
		}
		return false;
	});
	document.getElementById("fapp_client_bin").addEventListener('click',function(e){
		var clients = set_selected_num();
		if(clients.length > 0){
			if(confirm("¿En verdad quiere eliminar a los clientes seleccionados?")){
				var IDs = "["; var RFCs = "[";
				for(i = 0;i < clients.length;i++){
					IDs += clients.items[i].id + ",";
					RFCs += '"' + clients.items[i].getElementsByClassName("fapp_client_RFC")[0].innerHTML + '",';
				}
				IDs = IDs.replaceAt(IDs.length - 1, "]"); RFCs = RFCs.replaceAt(RFCs.length - 1, "]");
				send_delete(IDs, RFCs);
			}
		}else{
			alert("Por favor seleccione al menos un cliente");
		}
		return false;
	});
	
	//Add client input handlers
	document.getElementsByClassName("fapp_input_cross")[0].addEventListener('click',function(){
		hide_popup();
	});
	document.getElementById("fapp_input_name").addEventListener('keypress',function(){
		var name = document.getElementById("fapp_input_name");
		name.style.backgroundColor = "rgba(255,255,255,0.2)";
	});
	document.getElementById("fapp_input_rfc").addEventListener('keypress',function(){
		var rfc = document.getElementById("fapp_input_rfc");
		rfc.style.backgroundColor = "rgba(255,255,255,0.2)";
	});
	document.getElementById("fapp_input_pass").addEventListener('keypress',function(){
		var pass = document.getElementById("fapp_input_pass");
		pass.style.backgroundColor = "rgba(255,255,255,0.2)";
	});
	document.getElementById("fapp_input_repass").addEventListener('keypress',function(){
		var repass = document.getElementById("fapp_input_repass");
		repass.style.backgroundColor = "rgba(255,255,255,0.2)";
	});
	document.getElementsByClassName("fapp_input_check")[0].addEventListener('click',function(){
		var name = document.getElementById("fapp_input_name");
		var rfc = document.getElementById("fapp_input_rfc");
		var pass = document.getElementById("fapp_input_pass");
		var repass = document.getElementById("fapp_input_repass");
		
		var client = set_selected_num().items[0];
		var addedit = document.getElementsByClassName("fapp_input_main_visible")[0].id;
		
		trim_whites(name, true);
		trim_whites(rfc, false);
		rfc.value = rfc.value.toUpperCase();
					
		if(name.value != ""){
			if(rfc.value != "" && (rfc.value.length == 12 || rfc.value.length == 13)){
				if(pass.value == repass.value){
					if(addedit == 'add' && pass.value != ""){
						var duplicated = client_exists(name.value, rfc.value, null);
						(!duplicated) ? query_client_change(addedit, client) : alert('El campo: "' + duplicated + '" ya existe en su lista de clientes');
					}else if(addedit == 'edit'){
						var duplicated = client_exists(name.value, rfc.value, client.id);
						(!duplicated) ? query_client_change(addedit, client) : alert('El campo: "' + duplicated + '" ya existe en su lista de clientes');
					}else{
						pass.style.backgroundColor = "rgba(255,166,155,0.5)";
					}
				}else{
					repass.style.backgroundColor = "rgba(255,166,155,0.5)";
				}
			}else{
				rfc.style.backgroundColor = "rgba(255,166,155,0.5)";
			}
		}else{
			name.style.backgroundColor = "rgba(255,166,155,0.5)";
		}
	});
	
	//Client input, password reveal
	document.getElementById("fapp_passcover").addEventListener('click',function(){
		document.getElementById("fapp_passcover").style.display = "none";
	});
}

function client_exists(name, rfc, omitID){
	for(i = 0;i < json_arr.length;i++){
		if(omitID == json_arr[i].id) continue;
		if(name == json_arr[i].name) return name;
		if(rfc == json_arr[i].rfc) return rfc;
	}
	return false;
}

function trim_whites(inputElement, extra){
	if(extra){
		inputElement.value = inputElement.value.replace(/\s\s+/g," ");
		while(inputElement.value[0] == " "){inputElement.value = inputElement.value.replaceAt(0,"");};
		while(inputElement.value[inputElement.value.length - 1] == " "){inputElement.value = inputElement.value.replaceAt(inputElement.value.length - 1,"");};
	}else{
		inputElement.value = inputElement.value.replace(/ /g,"");
	}
}

function send_delete(IDs, RFCs){
	var status_image = document.getElementById("fapp_status");
	status_image.src = status_loading;
	var jsoned = JSON.parse('{"action":"get_php","method":"POST","url":"","data":[]}');
	jsoned.url = del_clients_php;
	jsoned.data[0] = {name:"ID", value:IDs};
	jsoned.data[1] = {name:"RFC", value:RFCs};
	chrome.extension.sendMessage(jsoned,function(response){
		if(response.answer == 'Error'){
			alert("No se ha podido procesar la respuesta del servidor. Inténtelo más tarde");
			return false;
		}else{
			if('Scs_1'){
				refresh_clients(false);
				return false;
			}else{
				alert("Los clientes no se pudieron eliminar. Por favor inténtelo nuevamente");
				return false;
			}
		}
	});
	return false;
}

String.prototype.replaceAt = function(index, character){
	if(character != ""){
		return this.substr(0,index) + character + this.substr(index+character.length);
	}else{
		return this.substr(0,index) + character + this.substr(index+1);
	}	
};

function set_selected_num(){
	var items = document.getElementsByClassName("fapp_client_selected"); 
	var n = items.length;
	document.getElementById("fapp_client_count").innerHTML = n;
	return {items:items, length:n};
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

function throw_popup(addedit, client){	
	//Fill form if Edit mode
	var name = document.getElementById("fapp_input_name");
	var rfc = document.getElementById("fapp_input_rfc");
	var pass = document.getElementById("fapp_input_pass");
	var repass = document.getElementById("fapp_input_repass");
	
	if(addedit == 'edit'){
		name.value = client.getElementsByClassName("fapp_client_name_holder")[0].innerHTML;
		rfc.value = client.getElementsByClassName("fapp_client_RFC")[0].innerHTML;
		document.getElementById("fapp_passcover").style.display = "block";
	}else{
		name.value = "";
		rfc.value = "";
	}
	pass.value = "";
	repass.value = "";
	
	//Remove red marks
	name.style.backgroundColor = "rgba(255,255,255,0.2)";
	rfc.style.backgroundColor = "rgba(255,255,255,0.2)";
	pass.style.backgroundColor = "rgba(255,255,255,0.2)";
	repass.style.backgroundColor = "rgba(255,255,255,0.2)";
	
	//Show it
	document.getElementsByClassName("fapp_cover_page")[0].className = "fapp_cover_page_visible";
	document.getElementsByClassName("fapp_input_main")[0].className = "fapp_input_main_visible";
	
	//Identify it
	document.getElementsByClassName("fapp_input_main_visible")[0].id = addedit;
}

function hide_popup(){
	document.getElementsByClassName("fapp_cover_page_visible")[0].className = "fapp_cover_page";
	document.getElementsByClassName("fapp_input_main_visible")[0].className = "fapp_input_main";
}

function query_client_change(option, client){
	var status_image = document.getElementById("fapp_status");
	status_image.src = status_loading;
	var jsoned = JSON.parse('{"action":"get_php","method":"POST","url":"","data":[]}');
	jsoned.data[0] = {name:"Name", value:document.getElementById("fapp_input_name").value};
	jsoned.data[1] = {name:"Username", value:document.getElementById("fapp_input_rfc").value};
	jsoned.data[2] = {name:"Password", value:document.getElementById("fapp_input_pass").value};
	switch(option){
		case 'add':
			jsoned.url = add_client_php; 
			break;
		case 'edit':
			jsoned.url = edit_client_php;
			jsoned.data[3] = {name:"ID", value:client.id};
			break;
		default:
			return false;
	}
	chrome.extension.sendMessage(jsoned,function(response){
		if(response.answer == 'Error'){
			status_image.src = status_wrong;
			alert("Ocurrió un problema al enviar su solicitud, por favor intente más tarde");
		}else{
			switch(response.answer){
				case 'Scs_1'://Todo chingón
					refresh_clients(false);
					break;
				case 'Scs_0'://No se pudo
					status_image.src = status_wrong;
					alert("No es posible realizar la acción en este momento. Por favor intente más tarde");
					break;
				case 'Err_7'://No se agrega porque ya hay!
					status_image.src = status_ready;
					alert("¡Ya tienes registrado este RFC!");
					break;
				default:
					status_image.src = status_wrong;
			}
			hide_popup();
		}
	});
	return false;
}

function create_stack(){
	return {
			current_id: null,
			current_state: "stack_gen",
			state_status: "idle",
			states: ["stack_gen","login","emrec","dates","download","logout"],
			ids: []
			};
}

function gen_stack(){
	var selected = document.getElementsByClassName("fapp_client_selected");
	if(selected.length != 0){
		var stack = create_stack();
		for(i = 0;i < selected.length;i++){
			stack.ids.push(parseInt(selected[i].id));
		}
		stack.current_id = stack.ids[0];
		stack.state_status = "finished";
		return stack;
	}else{
		alert("Seleccione al menos un cliente para iniciar la descarga");
		return false;
	}
}

//Main! - It goes check_page() >> is_session_active() >> build_menu()
//chrome.storage.local.set({stack:gen_stack()});
check_page();