chrome.extension.onMessage.addListener(function(message, sender, sendResponse){if(message.action == 'get_php'){var req = new XMLHttpRequest();req.onload = function(){sendResponse({answer:req.responseText});};req.onerror = function(){sendResponse({answer:'Error'});};var method = message.method;var resdata = "";for(i = 0; i < message.data.length; i++){resdata = resdata + message.data[i].name + "=" + message.data[i].value + "&";}resdata = resdata.substring(0, resdata.length - 1);if(method == "GET"){req.open("GET", message.url + "?" + resdata, true);req.send();}else if(method == "POST"){req.open("POST", message.url, true);req.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");req.send(resdata);}return true;}});