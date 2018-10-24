<?php 

if(!empty($_POST['json_string'])) {
    $data = $_POST['json_string'];
    $fname = "tags.json";

    $file = fopen($fname, 'w');
    fwrite($file,$data);
    fclose($file);

    echo $_POST['json_string'];
}

?>