<?php
header("Content-type:text/html; charset=utf-8");
require_once("nDOM.php");
$xmlDoc = new nDOMDocument();
$xmlDoc->load("../data/data.xml");
$h = $xmlDoc->transformNode("view.xsl", null);
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Langlois admin view</title>
        <style>
            body {
                font-family: Arial, sans-serif;
            }
            table {
                width: 100%;
                border: solid 1px #111;
                border-collapse: collapse;
            }
            th, td {
                font-size: 14px;
                border: solid 1px #111;
                padding: 2px;
            }

            td > img {
                height: 40px;
            }

            .w5 {width: 5%;}
            .w10 {width: 10%;}
            .w20 {width: 20%;}
            .w50 {width: 50%;}
            .c  {text-align: center;}

            .t { font-size: 13px; padding: 4px; font-family: 'Georgia'; line-height: 150%;}
            .t p { margin: 0; padding: 0;}

            .info {
                min-width: 20px; padding: 2px; text-align: center;
                font-weight: bold; color: #fff;
            }

            .info.ok {
                background-color: #393;
            }

            .info.no {
                background-color: #c33;
            }

            .info.notfound {
                background-color: orange;
            }

            .info a {
                text-decoration: none; color: inherit;
            }

            .bg { background-color: #ccc; }
            .bg1 { background-color: #adf; }
            .bg2 { background-color: #daf; }
            .bg3 { background-color: #fda; }
            .bg4 { background-color: #afd; }
            

        </style>
    </head>
    <body>
        <p><a href="makejson.php" target="_blank">Rafraîchir les données</a> (puis F5 pour recharger cette vue)</p>

        <?php echo($h) ?>
        <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js"></script>
        <script>
        $(function () {
            // Check images
            $(".info").each(function () {
                var request,
                    $el = $(this),
                    img = $el.data("img"),
                    url = "http://cf.pasoliniroma.com/static/langlois/img/" + img + ".jpg";

                console.log("Img", img);
                if (!!img) {
                    request = $.ajax(url, {
                        type: "HEAD",
                        dataType: "jsonp",
                        async: true,    
                        cache: false,
                        crossDomain: true,
                        complete: function (e) {
                            var status = e.status;
                            if (status === 200) {
                                $el.addClass("ok").html("<a href='" + url + "' target='_blank'>OK</a>");
                            } else {
                                $el.addClass("notfound").html("Non trouvé");
                            }
                        }
                    });
                } else {
                    $el.addClass("no").html("Non");
                }



            });



        });
        </script>
    </body>
</html>

