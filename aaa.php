<?php
//phpinfo();
header("Content-type: text/html; charset=utf-8");
$conn= oci_connect('huangweidb2', 'Guisinst', '222.44.10.146:1521/oss');
if($conn) {
    echo"连接oracle成功！";
}else{
    echo"连接oracle失败！";exit;
}
?>