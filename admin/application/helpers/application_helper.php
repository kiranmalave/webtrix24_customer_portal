<?php
defined('BASEPATH') OR exit('No direct script access allowed');

	if(!function_exists('dateFormat')){

		function dateFormat($date,$format='Y-m-d')
		{
			if($date != "0000-00-00 00:00:00" && $date != "0000-00-00" && $date != null && $date != "") {
	      		return date("{$format}",strtotime($date));
	        }else
	        {
	            return null;
	        }
		}
	}
	function getFirstAndLastWordInitials($name) {
		// Remove extra spaces
		$name = trim($name);
	
		// Break the string into an array of words
		$words = explode(" ", $name);
	
		// Get the first and last word
		$firstWord = $words[0];
		$lastWord = end($words);
	
		// Get the first letter of the first and last word
		$firstLetter = strtoupper($firstWord[0]);
		$lastLetter = strtoupper($lastWord[0]);
	
		return $firstLetter . $lastLetter;
	}

?>