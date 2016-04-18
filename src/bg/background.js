// This function is called onload in the popup code
function switchTab(window,id) { 
//alert(id)
chrome.windows.update(parseInt(window), {focused: true})
     chrome.tabs.update(parseInt(id), {active: true});
    
}; 

function deleteTabs(tabIds){
	//chrome.tabs.remove(integer or array of integer tabIds, function callback)
	chrome.tabs.remove(tabIds,
		function(){chrome.runtime.sendMessage( {action: 'update'})
    });
	//ask front end to update

}
