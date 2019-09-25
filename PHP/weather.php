<?php

	/**************************
	 * Add your code to connect to your database here
	 */
	try {
		$conn = new PDO('mysql:host=mysql.cms.waikato.ac.nz;dbname=acs45;', 'acs45', 'my10938600sql');
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}
		catch (PDOException $e) {
		echo 'Connection failed: ' . $e->getMessage();
	}

	  /***************************
    * 
    * Add code here to query the DB for weather information for the given town
    * 
    * Construct a PHP array object containing the weather data 
    * and return as JSON
    * 
    */

	$town = $_GET['town'];	//get the town name from the request
	$a = [4];	//create an array of size 4
	foreach($conn->query("SELECT town, outlook, min_temp, max_temp FROM weather WHERE town = '$town'") as $row){	//get the town name, outlook, min and max temp for the selected town
		//add each piece of data to the array
	    $a[0] = $row['town'];
	    $a[1] = $row['outlook'];
	    $a[2] = $row['min_temp'];
	    $a[3] = $row['max_temp'];
	}
	$json = json_encode($a);	//encode the array as a json object
	echo $json;	//pass back the json object 

	

 
   
	


