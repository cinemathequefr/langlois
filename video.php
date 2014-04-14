<?php
$id = $_REQUEST["id"];
$w = (isset($_REQUEST["width"]) &&  $_REQUEST["width"] !== "" ? (int) $_REQUEST["width"] : 600);
$h = (isset($_REQUEST["height"]) &&  $_REQUEST["height"] !== "" ? (int) $_REQUEST["height"] : 450);
?>
<html>
	<head></head>
	<body style="margin:0;">
		<div style="display:none"></div>
		<script language="JavaScript" type="text/javascript" src="http://admin.brightcove.com/js/BrightcoveExperiences.js"></script>
		<object id="myExperience2292442024001" class="BrightcoveExperience">
		  <param name="bgcolor" value="#888888" />
		  <param name="width" value="<?php echo($w); ?>" />
		  <param name="height" value="<?php echo($h); ?>" />
		  <param name="playerID" value="592570533001" />
		  <param name="playerKey" value="AQ~~,AAAAiWK05bE~,EapetqFlUMNn0qIYma980_NuvlxhZfq6" />
		  <param name="isVid" value="true" />
		  <param name="isUI" value="true" />
		  <param name="dynamicStreaming" value="true" />
		  <param name="@videoPlayer" value="<?php echo($id); ?>" />
		</object>
		<script type="text/javascript">brightcove.createExperiences();</script>
	</body>
</html>