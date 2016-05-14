
// References : http://evulse.github.io/finderSelect/



//global tablist object
var gTabListId = "tabList";  //for tablist html ID
var gTabList = "";  //for tablist object
var gDelBtnId = "delSelected";
var gSelectBtnId = "selectToggle";


function renderStatus(statusText) {
	document.getElementById('status').innerText = statusText;
}

document.addEventListener('DOMContentLoaded', function() {

//add event listner for selectall checkbox


document.addEventListener("click", function(e){ 
	
	var srcElement = e.srcElement;
	var cid = (this.activeElement.id);

  // Lets check if our underlying element is a LINK.
	if (srcElement.nodeName == 'A') {		
		handleLinkClick(srcElement,cid);
	}
	//check if deleteSelected button is clicked
	else if(cid==gDelBtnId){
		handleDeleteEvent();	  		

	}else if(cid==gSelectBtnId){
	//check if selectAll button is clicked
		handleSelectEvent(this.activeElement);			
	}	


	});

//show tab list 
showTabListing();

});


//function get tab listings in html list
function showTabListing(){
	var tabList = "<ul class='list-group' id='"+gTabListId+"'>";
	var tempFocus = 0;
 chrome.tabs.query({}, function(tabs) { // blah 
 	for(var i=0;i<tabs.length;i++){
 		var title = tabs[i].title.substring(0, 70)+".." //only length x title is added
 		tabList+="<li class='list-group-item un-selected' id='"+tabs[i].id+"'>";
 		tabList+="<img src='"+tabs[i].favIconUrl+"' class='tabFavicon'>&nbsp;";
 		tabList+="<span>"+title+"</span>";	
 		tabList+="<a class='pull-right' id='"+tabs[i].windowId+"|"+tabs[i].id+	"' href='"+tabs[i].url+"'>Open</a></li>"; 			 
		tempFocus++;
 	}
 	tabList+="</ul>"

 	document.getElementById('tabContents').innerHTML = tabList;
 	//apply cosmetic improvements for user accessibility
 	finalize();

 });
}
//init for tablist and search box
function finalize(){
		gTabList = $('#'+gTabListId).finderSelect({totalSelector:".tab-count",menuSelector:"#tab-menu",selectClass:'active',enableDesktopCtrlDefault:true});
	 $('#'+gTabListId).btsListFilter('#searchinput', {itemChild: 'span'});
	
}

//select all and select None tabs
function updateAllTabs(status) {
	if(status){
		gTabList.finderSelect('highlightAll');
	}else{
		gTabList.finderSelect('unHighlightAll');
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

	console.log(gTabList.finderSelect("selected")	);
	var selectedTabs = gTabList.finderSelect("selected");
	var tabIds = [];
	for(var i=0, n=selectedTabs.length;i<n;i++) {
		tabIds.push(parseInt(selectedTabs[i].id));
	}
	return tabIds;
}


//listen to background orders after processing
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.action=='update'){
		gDelBtn.button('reset'); //reset delete button text
		setTimeout(function(){showTabListing();}, 1000);
		return;
		//showTabListing();
	}
});

// providing some additional keyboard functions
window.addEventListener("keydown", checkKeyPressed, false);
 
function checkKeyPressed(e) {
    if (e.keyCode == "13") { //enter key
        var selected = gTabList.finderSelect('selected');
        //if only one element is selected then switch else do nothing                
        if(selected.length==1){
        	var link  = selected.children('A')[0];
        	var cid = link.id;
        	handleLinkClick(selected,cid);
        }
    }else if(e.keyCode=="46"){ //delete key
    	handleDeleteEvent();
    }
}

//handle the delete button click event
function handleDeleteEvent(){
	var tabIds = getSelectedTabs();
			//remove tab checkboxes from front end
	  		//removeTabs(tabIds);
	  		//remove actual tabs 
	  		gDelBtn = $('#'+gDelBtnId).button('loading')

	  		chrome.runtime.getBackgroundPage(function(eventPage) {
	  			eventPage.deleteTabs(tabIds);
	  		});
			// showTabListing();
}

//handles selection toggle button click event
function handleSelectEvent(e){
			if(e.value=="Select All"){
				updateAllTabs(true);
				e.value="Select None";
			}else{
				updateAllTabs(false);
				e.value="Select All";
			}
			return;
}

//handles the tab link click events
function handleLinkClick(srcElement,cid){		
		var href = srcElement.href;    
		var temp = cid.split("|")
		var windowId = temp[0]
		var id = temp[1]

		chrome.runtime.getBackgroundPage(function(eventPage) {
			eventPage.switchTab(windowId,id);
		});
}