<?xml version="1.0" encoding="iso-8859-1"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" encoding="utf-8" indent="yes" omit-xml-declaration="no"/>

<xsl:template match="root">
	<xsl:apply-templates select="points"/>
</xsl:template>

<xsl:template match="node()">
	<xsl:copy>
		<xsl:apply-templates select="@*"/>
		<xsl:apply-templates select="point|title|cat|pos|desc|text()"/>
	</xsl:copy>
</xsl:template>

<xsl:template match="@*">
	<xsl:element name="{name()}"><xsl:value-of select="."/></xsl:element>
</xsl:template>


</xsl:stylesheet>