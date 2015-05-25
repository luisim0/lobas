//Globals
var hide_unnactive_URL = chrome.extension.getURL("IMGs/hide_unnactive.png");
var hide_active_URL = chrome.extension.getURL("IMGs/hide_active.png");

//Functions
function build_menu(){
	var menu = document.createElement('div');
	menu.id = 'fapp_main_panel';
	menu.className = 'fapp_main_panel';
	menu.innerHTML = "<div id='fapp_frame_manipulate'><div id='fapp_hide_holder'><img src='' id='fapp_hide_button' class='no_rotate'/></div><div id='fapp_logo_holder'><img src='' id='fapp_logo'/></div></div><div id='fapp_frame_contents' class='fapp_frame_contents'><a id='test'>Place RFC</a><br><a id='collapse'>Show/Hide</a></div>";
	
	//Insert structure
	document.body.appendChild(menu);
	
	//Place/edit images
	var hide_button = document.getElementById("fapp_hide_button"); 
	hide_button.src = hide_unnactive_URL;
	hide_button.width = "40"; hide_button.height = "40";
	document.getElementById("fapp_logo").src = chrome.extension.getURL("IMGs/facturapp_logo_ver.png");
}

function add_hide_listener(){
	var hide_button = document.getElementById("fapp_hide_button");
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
	hide_button.addEventListener('mouseover',function(){
		hide_button.src = hide_active_URL;
	});
	hide_button.addEventListener('mouseout',function(){
		hide_button.src = hide_unnactive_URL;
	});
	var test_link = document.getElementById("test");
	test_link.addEventListener('click',function(){
		chrome.extension.sendMessage({action:'get_php'},function(response){
			var rfc_box = document.getElementsByName("Ecom_User_ID")[0];
			rfc_box.value = response.answer;
		});
	});
}

//Main!
build_menu();
add_hide_listener();
