<?xml version="1.0" encoding="iso-8859-1"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="html" encoding="utf-8" indent="yes" omit-xml-declaration="no"/>

<xsl:template match="root">
    <xsl:apply-templates select="points"/>
</xsl:template>

<xsl:template match="points">
    <table summary="">
        <tr>
            <th class="w5">Id</th>
            <th class="w5">Pos</th>
            <th class="w10">Titre</th>
            <th class="w50">Desc</th>
            <th class="w5">Visuel</th>
        </tr>
        <xsl:apply-templates match="point">
            <xsl:sort select="cat" data-type="number" order="ascending"/>
            <xsl:sort select="@id" data-type="number" order="ascending"/>
        </xsl:apply-templates>
    </table>
</xsl:template>

<xsl:template match="point">
    <tr class="bg{cat}">
        <td class="c"><a target="_blank" href="../index.htm#!/point/{@id}"><xsl:value-of select="@id"/></a></td>
        <td class="c"><xsl:value-of select="pos"/></td>
        <td><xsl:value-of select="title"/></td>
        <td class="t"><xsl:value-of select="desc" disable-output-escaping="yes"/></td>
        <!-- <td><img src="http://cf.pasoliniroma.com/static/langlois/img/{m/@id}.jpg"/></td> -->
        <td>
            <xsl:for-each select="m[@type='img']">
                <div class="info" data-img="{@id}"></div>
            </xsl:for-each>
            <xsl:for-each select="m[@type='video']">
                <div class="info video"></div>
            </xsl:for-each>
            <xsl:if test="not(m/@id)">
                <div class="info no"></div>
            </xsl:if>
        </td>
    </tr>
</xsl:template>



</xsl:stylesheet>

