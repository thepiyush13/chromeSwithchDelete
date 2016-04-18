function renderStatus(statusText) {
	document.getElementById('status').innerText = statusText;
}


//event listner for shortcut commands up and down key
chrome.commands.onCommand.addListener(function(command) {
        console.log('Command:', command);
});





document.addEventListener('DOMContentLoaded', function() {

//add event listner for selectall checkbox
init();

document.addEventListener("click", function(e){ 
	console.log('click');
	var srcElement = e.srcElement;
	var cid = (this.activeElement.id);
  // Lets check if our underlying element is a LINK.
  if (srcElement.nodeName == 'A') {
  	var href = srcElement.href;    
  	var temp = cid.split("|")
  	var windowId = temp[0]
  	var id = temp[1]

  	chrome.runtime.getBackgroundPage(function(eventPage) {
  		eventPage.switchTab(windowId,id);
  	});
  }
	  	//check if deleteSelected button is clicked
	  	else if(cid=="delSelected"){
	  		var tabIds = getSelectedTabs();
			//remove tab checkboxes from front end
	  		//removeTabs(tabIds);
	  		//remove actual tabs 
	  		document.getElementById('status').innerHTML = 
	  		"<br/><h1>Deleting "+tabIds.length +" tabs...</h1>";
	  		chrome.runtime.getBackgroundPage(function(eventPage) {
	  			eventPage.deleteTabs(tabIds);
	  		});
			// showTabListing();

	  	}
	  
	  else{
	  	//show tab list 

	  }


	});

		//show tab list 
showTabListing();

});


//function get tab listings in html list
function showTabListing(){
	var tabList = "<ul id='tabList'>";
 chrome.tabs.query({}, function(tabs) { // blah 
 	for(var i=0;i<tabs.length;i++){
 		var title = tabs[i].title.substring(0, 70)+".." //only length x title is added
 		tabList+="<li><input type='checkbox' name='tabCheckBox' value='"+tabs[i].id+"'>&nbsp;<a id='"+tabs[i].windowId+"|"+tabs[i].id+	"' href='"+tabs[i].url+"'>";
 		tabList+="<img src='"+tabs[i].favIconUrl+"' style='width:16px;height:16px;'>&nbsp;";
 		tabList+=title;
 		tabList+="</a></li>";
 	}
 	tabList+="</ul>"

 	document.getElementById('status').innerHTML = tabList;

 });
}
//toggles the popup tablist checkbox for select all etc
function init(){
	console.log('init');
	var checkbox = document.getElementById("selectAll");
	if (checkbox.addEventListener) {
		checkbox.addEventListener ("change", OnChangeCheckbox, false);
	}
}

function OnChangeCheckbox (event) {
	console.log('checked');
	var checkbox = event.target;
	if (checkbox.checked) {
		updateAllTabs(true);

	}
	else {
		updateAllTabs(false);
	}
}
function updateAllTabs(status) {
	var checkboxes = document.getElementsByName('tabCheckBox');
	for(var i=0, n=checkboxes.length;i<n;i++) {
		checkboxes[i].checked = status;
	}
}
//removes tab checkboxes listing from popup html
function removeTabs(tabIds){
	var checkboxes = document.getElementsByName('tabCheckBox');
	var n=checkboxes.length;
	for(var i=0; i<n;i++) {
		if(checkboxes[i] && checkboxes[i].checked == true){
		checkboxes[i].parentElement.parentElement.removeChild(checkboxes[i].parentElement);
	}
	}
}

//returns tabids for selected tabs 
function getSelectedTabs(){

	var checkboxes = document.getElementsByName('tabCheckBox');
	var tabIds = [];
	for(var i=0, n=checkboxes.length;i<n;i++) {
		if(checkboxes[i].checked == true){
			tabIds.push(parseInt(checkboxes[i].value));
		}
	}
	return tabIds;
}


//listen to background orders
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.action=='update'){
		showTabListing();
	}
});