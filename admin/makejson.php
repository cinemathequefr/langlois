<?php
/**
 * makeJson
 */
include("nDOM.php");
include("indent.php");


header("Content-Type: text/plain");
$dom = new nDOMDocument();
$dom->load("../data/data.xml");


// Index (index.json)
$xml = $dom->transformNodeToDoc("index.xsl", array())->saveXML();
$xml = str_replace(array("\n", "\r", "\t"), '', $xml);
$xml = trim(str_replace('"', "'", $xml));
$simpleXml = simplexml_load_string($xml);
$json = json_encode($simpleXml);
$json = preg_replace('/>\s+</', "><", $json); // Retire les espaces entre deux éléments HTML
$json = preg_replace('/"(-?\d+\.?\d*)"/', "$1", $json); // Convertir les valeurs de forme numérique en type numérique



$arr = json_decode($json, true); // true returns array instead of stdClass object
$arr = $arr["point"];

$json = json_encode($arr);
$json = indent($json);
file_put_contents("../data/index.json", $json);

// Point (point/{id}.json)
$nodes = $dom->selectNodes("/root/points/point/@id");
foreach ($nodes as $node) {
	$id = $node->nodeValue;
	$xml = $dom->transformNodeToDoc("point.xsl", array("id" => $id))->saveXML();
	$xml = str_replace(array("\n", "\r", "\t"), '', $xml);
	$xml = trim(str_replace('"', "'", $xml));
	$simpleXml = simplexml_load_string($xml);
	$json = json_encode($simpleXml);
	$json = preg_replace('/>\s+</', "><", $json); // Retire les espaces entre deux éléments HTML
	$json = preg_replace('/"(-?\d+\.?\d*)"/', "$1", $json); // Convertir les valeurs de forme numérique en type numérique
	$json = preg_replace('/\s{2,}"/', "\"", $json); // Trim string values
	$json = preg_replace('/"\s{2,}/', "\"", $json); 

	$arr = json_decode($json, true); // true returns array instead of stdClass object
	$json = json_encode($arr);
	$json = indent($json);
	file_put_contents("../data/points/".$id.".json", $json);

	echo($json);

}




/*
// Places (un fichier par lieu/langue)
$nodes = $dom->selectNodes("/map/places/place/@id");
foreach ($nodes as $node) {
	$id = $node->nodeValue;
	foreach ($langs as $lang) {
		$xml = $dom->transformNodeToDoc("place.xsl", array("id" => $id, "lang" => $lang))->saveXML();
		$xml = str_replace(array("\n", "\r", "\t"), '', $xml);

		// 2014-01-27 : Commented out. What whas this for? Unwanted effects on the content.
		//$xml = trim(str_replace('"', "'", $xml));

		$simpleXml = simplexml_load_string($xml);
		$simpleXml->addChild("lang", $lang);

		$json = json_encode($simpleXml); // transforme objet simpleXML en chaîne JSON
		$arr = (array) json_decode($json); // transforme chaîne JSON en tableau associatif

		// Pour chaque entrée, faire en sorte que m (media) contienne un array (actuellement ce n'est pas le cas s'il y a un seul élément).
		if (array_key_exists("m", $arr)) {
			if (is_array($arr["m"]) == false) {
				$arr["m"] = array($arr["m"]);
			}
		}

		$json = json_encode($arr); // transforme tableau associatif en chaîne JSON
		$json = preg_replace('/"(-?\d+\.?\d*)"/', "$1", $json); // Convertir les valeurs de forme numérique en type numérique
		$json = indent($json);
		file_put_contents("../data/places/".$id."-".$lang.".json", $json);
	}
}


// Index
$xml = $dom->transformNodeToDoc("index.xsl", array())->saveXML();
$xml = str_replace(array("\n", "\r", "\t"), '', $xml);
$xml = trim(str_replace('"', "'", $xml));
$simpleXml = simplexml_load_string($xml);
$json = json_encode($simpleXml);
$json = preg_replace('/"(-?\d+\.?\d*)"/', "$1", $json); // Convertir les valeurs de forme numérique en type numérique

$arr = (array)json_decode($json);

var_dump($arr);

$json = json_encode($arr["place"]);
$json = indent($json);

file_put_contents("../data/places/index.json", $json);

// 2013-05-16: Pages files
$nodes = $dom->selectNodes("/map/pages/page/@id");
foreach ($nodes as $node) {
	$id = $node->nodeValue;
	foreach ($langs as $lang) {
		$xml = $dom->transformNodeToDoc("page.xsl", array("id" => $id, "lang" => $lang))->saveXML();
		$xml = str_replace(array("\n", "\r", "\t"), '', $xml);
		$xml = trim(str_replace('"', "'", $xml));
		$simpleXml = simplexml_load_string($xml);
		$simpleXml->addChild("lang", $lang);

		$json = json_encode($simpleXml); // transforme objet simpleXML en chaîne JSON
		$arr = (array) json_decode($json); // transforme chaîne JSON en tableau associatif

		var_dump($arr);
		file_put_contents("../data/pages/".$id."-".$lang.".json", $json);

	}
}

*/