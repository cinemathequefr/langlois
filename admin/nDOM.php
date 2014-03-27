<?php

/*
Classes :
nDOMDocument
nDOMElement
*/

/**
 * Class nDOMDocument
 * Extension de la classe DOMDocument
 * @version	2010-04-10
 * @author		Nicolas Le Thierry d'Ennequin
 */
class nDOMDocument extends DOMDocument {

    /**
     * Constructeur
     * @version	2010-04-10
     * @param		$version		(str) Version XML (eg "1.0")
     * @param		$encoding		(str) Encodage (eg "utf-8")
     */
    public function __construct ($version = NULL, $encoding = NULL) {
        parent::__construct($version, $encoding);
        $this->registerNodeClass("DOMDocument", "nDOMDocument"); // IMPORTANT - cf http://stackoverflow.com/questions/2585879
        $this->registerNodeClass("DOMElement", "nDOMElement"); // IMPORTANT - cf http://stackoverflow.com/questions/2585879
    }
  

    /**
     * selectNodes : selection d'un ensemble de noeuds par une expression XPath
     * @version	2010-04-02
     * @param		$xpath			(str) Expression XPath
     * @return		DOMNodeList
     */
    public function selectNodes ($xpath){
        $oxpath = new DOMXPath($this);
        return $oxpath->query($xpath);
    }


    /**
     * nDOMDocument::selectSingleNode
     * Sélection d'un noeud par une expression XPath
     * Si l'expression XPath selectionne plusieurs noeuds, seul le premier est renvoye.
     * @version	2010-04-02
     * @param		$xpath			(str) Expression XPath
     * @return		nDOMElement
     */
    public function selectSingleNode ($xpath){
        return $this->selectNodes($xpath)->item(0);
    }
  

    /**
     * nDOMDocument::transformNode
     * Applique une transformation XSLT au document et le renvoie sous forme de chaine
     * Le parametre $xslDoc peut etre le chemin relatif du fichier XSLT ou l'objet DOMDocument XLST.
     * ATTENTION : la signature de la methode a change. Le second parametre $xslVars est obligatoire (au minimum : array()).
     * @version	2012-03-21 (ajout du test : if (is_array($xslVars)) )
     * @param		$xslDoc			(String|DOMDocument) Document DOM XSLT ou son chemin relatif
     * @param		$xslVars		(Array) Liste cles/valeurs a passer en parametre comme variables globales XSLT
     * @return		String
     */
    public function transformNode ($xslDoc, $xslVars) {

        if (is_string($xslDoc)) {
            $xsl = $xslDoc;
            $xslDoc = new nDOMDocument;
            $xslDoc->load($xsl);
        }

        if (is_array($xslVars)) {
            foreach($xslVars as $key => $value){
                $xslDoc->selectSingleNode("/xsl:stylesheet/xsl:variable[@name='".$key."']")->nodeValue = $value;
            }
        }

        $oxslt = new XSLTProcessor();
        $oxslt->importStylesheet($xslDoc);
        return $oxslt->transformToXML($this);
    }
    

    /**
     * nDOMDocument::transformNodeToDoc
     * Applique une transformation XSLT au document et le renvoie sous forme d'objet nDOMDocument
     * Le parametre $xslDoc peut etre le chemin relatif du fichier XSLT ou l'objet DOMDocument XLST.
     * @version     2012-09-24
     * @param		$xslDoc			(String) Chemin relatif du fichier XSLT
     * @param		$xslDoc			(nDOMDocument) Document DOM XSLT
     * @param		$xslVars		(Array) Liste cles/valeurs a passer en parametre comme variables globales XSLT
     * @return		objet nDOMDocument
     */
    public function transformNodeToDoc ($xslDoc, $xslVars) {
    
        $xml = $this->transformNode($xslDoc, $xslVars); // Applique la transformation sous forme de chaîne
        $xmlDoc = new nDOMDocument();
        /*
        $header = "<?xml version=\"".$this->version."\" encoding=\"".$this->encoding."\"?>";
        $xmlDoc->loadXML($header.$xml);
        */
        $xmlDoc->loadXML($xml);
        return $xmlDoc;
    }

    
    
    /**
     * nDOMDocument::getNodeFromTransform
     * Renvoie le noeud résultant d'une transformation XSLT, en le rattachant à nDOMDocument
     * NB : le noeud est rattaché à nDOMDocument mais n'est pas placé dans l'arbre
     * @version     2012-09-26
     * @param       $xmlDoc         (nDOMDocument) Document DOM sur lequel appliquer une transformation
     * @param       $xslDoc         (nDOMDocument) Document DOM XSLT
     * @param       $xslVars        (Array) Liste cles/valeurs a passer en parametre comme variables globales XSLT 
     * @return      objet nDOMNode
     * TODO : faut-il contrôler que la transformation renvoie bien du XML ? 
     */
    public function getNodeFromTransform ($xmlDoc, $xslDoc, $xslVars) {

        $xmlDoc2 = $xmlDoc->transformNodeToDoc($xslDoc, $xslVars);

        return $this->importNode($xmlDoc2->documentElement, true);

    }
    
    
}

/**
 * Class nDOMElement
 * Extension de la classe DOMElement
 * @version	2010-04-10
 * @author		Nicolas Le Thierry d'Ennequin
 */
class nDOMElement extends DOMElement {

    /**
     * selectNodes : selection d'un ensemble de noeuds par une expression XPath
     * @version	2010-04-02
     * @param		$xpath			(str) Expression XPath
     * @return		DOMNodeList
     */
    public function selectNodes ($xpath) {
        $oxpath = new DOMXPath($this->ownerDocument);
        return $oxpath->query($xpath, $this);
    }

    /**
     * selectSingleNode : selection d'un noeud par une expression XPath
     * Si l'expression XPath selectionne plusieurs noeuds, seul le premier est renvoye.
     * @version	2010-04-02
     * @param		$xpath			(str) Expression XPath
     * @return		nDOMElement
     */
    public function selectSingleNode($xpath) {
        return $this->selectNodes($xpath)->item(0);
    }
    



}




?>
