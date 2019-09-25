/*
 * Constructor function for a WeatherWidget instance.
 * 
 * container_element : a DOM element inside which the widget will place its UI
 *
 */
 
function WeatherWidget(container_element){
	var id = container_element.id;
	//declare the data properties of the object 
	var _townlist = [];
	var _request;
	var towns = ["Auckland", "Christchurch", "Dunedin", "Hamilton", "Tauranga", "Wellington"];

	var _ui = {  
		container : null,       //container for all UI elements
		selectBar : null,          //div for title & drop down
		sortBar : null,          //div for sorting buttons
		sortByTown : null,      //radio button 
		townLabel : null,       //label for town radio button
		sortByMax : null,       //radio button
		maxLabel : null,        //label for max radio button
		dropdown : null,        //select - dropdown list of towns 
		list : null,            //container for list of weather lines
	}
	
	let {container, mainBar, sortBar, sortByTown, sortByMax, dropdown, list} = _ui;
    
    
		//declare an inner object literal to represent the widget's UI
		//write a function to create and configure the DOM elements for the UI
	var _createUI = function(c){
            container = c;
            c.className = "monitor";	//set the class name for the container
            
		//create the top bar which holds the drop down menu and title
            selectBar = document.createElement("div");
            selectBar.className = "title";
            selectBar.label = document.createElement("span");
            selectBar.label.innerHTML = "Select Town:";
            selectBar.appendChild(selectBar.label);
                      
		//create the drop down menu, add an event listener which listens for change in a selection
            dropdown = document.createElement("select");
            dropdown.addEventListener("change", _getTown);
            
		//add all the different options to the select (drop down) list
            for(var i = 0; i < towns.length; i++){
                var option = document.createElement("option");
                option.innerHTML = towns[i];
                dropdown.appendChild(option);
		}
            selectBar.appendChild(dropdown);
            
		//creates the container for the bottom bar - where the radio buttons for sorting are
            sortBar = document.createElement("div");
            sortBar.className = "toolBar";
            sortBar.label = document.createElement("span");
            sortBar.label.innerHTML = "Sort By";
            sortBar.label.className = "section_label";
            
		//creates the radio button which triggers sorting by the town name
            sortByTown = document.createElement("input");
            sortByTown.type = "radio";
            sortByTown.name = id;
            sortByTown.value = "town";
            sortByTown.checked = true;		//set sort by town as the default
            sortByTown.addEventListener("change", _refreshTownList);	//add an event listener to check if the radio button checked has been changed
            
		//creates the label for the sort by town radio button
            townLabel = document.createElement("label");
            townLabel.innerHTML = "Town";
            townLabel.for ="town";
            townLabel.className = "section_label";
            
		//creates the radio button which triggers sorting the list by the max temperature
            sortByMax = document.createElement("input");
            sortByMax.type = "radio";
            sortByMax.name = id;
            sortByMax.value = "max";
            sortByMax.addEventListener("change", _refreshTownList);	//add an event listener to check if the radio button checked has been changed
            	//creates the label for sorting by max temp
            maxLabel = document.createElement("label");
            maxLabel.innerHTML = "Max Temp";
            maxLabel.for = "max";
            maxLabel.className = "section_label";
            
		//add the radio buttons and labels to the 'sortbar' container
            sortBar.appendChild(sortBar.label);
            sortBar.appendChild(sortByTown);
            sortBar.appendChild(townLabel);
            sortBar.appendChild(sortByMax);
            sortBar.appendChild(maxLabel);
            
		//create a div container which will hold the weather lines to display the town and weather info
            list = document.createElement("div");
            list.className = "list";
            
		//add the select bar, sort bar and list containers to the main container for the widget
            container.appendChild(selectBar);
            container.appendChild(sortBar);
            container.appendChild(list);
		}

    //function which creates an ajax request
    var ajaxRequest = function(method, url, data, callback){
        var _request = new XMLHttpRequest();
        _request.open(method, url, true);
        
        if(method == "POST"){
            _request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        
        _request.onreadystatechange = function(){
            if(_request.readyState == 4){
                if(_request.status == 200){
                    var _response = _request.responseText;
                    callback(_response);
                }else{
                    alert("error");
                }
            }
        }
        _request.send(data);
    }
	
	//function which gets the value of the town that was selected from the dropdown menu
	//calls _addTown function which adds the town and weather details to the list
    var _getTown = function(){
        var selected = dropdown.value;
        _addTown(selected);
    }
	
	//creates an ajax request to get the weather information for the given town, then calls _addTownCallback to add this info to the list
        var _addTown = function(town) {
            var _url = "PHP/weather.php?town=" + town;
            ajaxRequest("GET", _url, "", _addTownCallback);
        }
        
        /* the call back function for adding a town
        decodes the json object returned from the php script and creates a new town line*/
        var _addTownCallback = function(info) {
            var town = JSON.parse(info);
            var newTown = new WLine(town[0], town[1], town[2], town[3]);	//creates a new weather line from the data passed back from the ajax request
            
            var _found = false;
            //checks if the town that has been selected is already being displayed, if it is, set found to true
            for(var i = 0; i < _townlist.length; i++){
                if(_townlist[i].getName() == newTown.getName()){
                    _found = true;
                }
            }
            //if the town isn't being displayed (found is false), add the town to the array of towns and refresh the display
            if(_found == false){
                _townlist.push(newTown);
                _refreshTownList();
            }
        }
        
        
        /* function to refresh the list of towns being displayed by the widget*/
        var _refreshTownList = function(){
            if(_townlist == null)	//if there are no towns to be displayed, return
                return;
		//removes all previous towns being displayed
            while(list.hasChildNodes()){
                list.removeChild(list.lastChild);
            }
            
            if(sortByMax.checked){  //if the sort is by max, call sortByMax to resort the list by the max temp
                _sortByMax();
            }
            else{   //otherwise call sortByTown to resort the list by the town name
                _sortByTown();
            }            
            
            //display each weather line in the townlist by appending the weather line to the list container
            for(var i = 0; i < _townlist.length; i++){
                var weatherLine = _townlist[i];
                list.appendChild(weatherLine.getDomElement());
            }
        }
        
        //sorts the townlist by comparing the name of each town
        var _sortByTown = function(){ 
            _townlist.sort(function(a, b){
            var x = a.getName().toLowerCase();	//ensures both strings are all lowercase to ensure correct sorting
            var y = b.getName().toLowerCase();
            if(x < y){return -1};	//if a is smaller - return -1 
            if(x > y){return 1};	//if a is larger - return 1
            return 0;			//if they are equal - return 0
        })
        }
        
        //sorts the townlist by comparing the max temp of each town
        var _sortByMax = function(){
            _townlist.sort(function(a, b){
            return (a.getMax() - b.getMax());
        })
        }
        
        
	 /**
	  * private method to intialise the widget's UI on start up
	  * this method is complete
	  */
	  var _initialise = function(container_element){
	  	_createUI(container_element);
	  	}
	  	
	  	
	/*********************************************************
	* Constructor Function for the inner WLine object to hold the 
	* full weather data for a town
	********************************************************/
	
	var WLine = function(wtown, woutlook, wmin, wmax){
		
		//declare the data properties for the object
		var _town = wtown;
        var _weather = woutlook.charAt(0).toUpperCase() + woutlook.slice(1);    //capitalises the first letter of the weather
        var _min = wmin;
        var _max = wmax;
		//declare an inner object literal to represent the widget's UI
        var _ui = {
            line : null,         //div to contain the line;
            townLabel : null,      //label for the town name
            weatherLabel : null,   //label for the weather  
            minLabel : null,         //label for the min temp
            maxLabel : null,        //label for the max temp
        }
        
        let{line, townLabel, weatherLabel, minLabel, maxLabel} = _ui;
        
		//write a function to create and configure the DOM elements for the UI
	var _createUI = function(container){
		//creates a div container to hold all the UI objects for the weather line
            line = document.createElement("div");
            line.className = "section";
            townLabel = document.createElement("span");
            townLabel.innerHTML = _town;
            townLabel.className = "section";
            
		//adds a label to store the weather outlook
            weatherLabel = document.createElement("span");
            weatherLabel.innerHTML = _weather;
            weatherLabel.className = "section";
            
		//adds a label to store the minimum temp
            minLabel = document.createElement("span");
            minLabel.innerHTML = _min;
            minLabel.className = "section";
            
		//adds a label to store the max temp
            maxLabel = document.createElement("span");
            maxLabel.innerHTML = _max;
            maxLabel.className = "section";
            
            	//adds all labels to the line container div
            line.appendChild(townLabel);
            line.appendChild(weatherLabel);
            line.appendChild(minLabel);
            line.appendChild(maxLabel);
	}
		
		//Add any remaining functions you need for the object
		//returns the div containing all the weather line info        
	this.getDomElement = function(){
            return line;
        }
        	//returns the name of the town
        this.getName = function(){
            return _town;
        }
        	//returns the max temperature of the town
        this.getMax = function(){
            return _max;
        }
		//_createUI() method is called when the object is instantiated
		_createUI();
  	};  //this is the end of the constructor function for the WLine object 
	
    
	//  _initialise method is called when a WeatherWidget object is instantiated
	 _initialise(container_element);
}
	 
//end of constructor function for WeatherWidget 	 
	 
	 
