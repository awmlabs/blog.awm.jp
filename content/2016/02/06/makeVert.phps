<?php

// 頂点の一筆書き(重複するけど)
$vertUnitList = [
             [ 0, 0, 0],
             [ 0, 0, 1],
             [ 0, 1, 1],
             [ 0, 1, 0],
             [ 0, 0, 0],
             [ 1, 0, 0],
             [ 1, 1, 0],
             [ 0, 1, 0], 
             [ 0, 1, 1], // 重複
             [ 0, 1, 1], // 重複
             [ 1, 1, 1],
             [ 1, 1, 1],
             [ 1, 1, 0],
             [ 1, 1, 1], // 重複
             [ 1, 0, 1],
             [ 0, 0, 1],
             [ 1, 0, 1], // 重複
             [ 1, 0, 0]
             ];

function multi255($x) { return 255*$x; }
foreach ($vertUnitList as $id => $u) {
    $vertUnitList[$id] = [$u[0] * 255, $u[1]*255, $u[2]*255];
}

// ここまでで。0,255 の頂点リスト完成
// ここから任意の変換

function RGB2YCbcr($rgb) {
    list($r, $g, $b) = $rgb;
    $y  =  0.29891 * $r + 0.58661 * $g + 0.11448 * $b;
    $cb = -0.16874 * $r - 0.33126 * $g + 0.50000 * $b + 128;
    $cr =  0.50000 * $r - 0.41869 * $g - 0.08131 * $b + 128;
    return [floor($y), floor($cb), floor($cr)];
}

function YCbCr2RGB($ycbcr) {
    list($y, $cb, $cr)= $ycbcr;
    $r = $y + 1.40200 * ($cr - 128);
    $g = $y - 0.34414 * ($cb - 128) - 0.71414 * ($cr - 128);
    $b = $y + 1.77200 * ($cb - 128);
    return [floor($r), floor($g), floor($b)];
}

$vertList = [];
foreach ($vertUnitList as $id => $u) {
    //    $vertList []=RGB2YCbcr($u);
    $vertList []= $u;
}

foreach ($vertList as $vert) {
    echo join(" ", $vert).PHP_EOL;
}

