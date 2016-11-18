+++
categories = ["PNG"]
date = "2016-11-18T17:02:28+09:00"
draft = false
tags = ["PNG"]
title = "任意のファイルから PNG を抜き出す"

+++

# ツールを作ったきっかけ

絵文字用フォントには色んな方式がありまして、その中でも Apple の標準カラー絵文字フォントと Google のNotoColorEmoji フォントは、フォントファイルの中に絵文字のPNG画像データが埋め込まれています。

<center> <img src="../figure-ttf.png" /> </center>

# カラー絵文字

カラー絵文字フォントの方式は大雑把に以下の種類に分けられます。

- a) SVG 画像を入れる
- b) フォントにPNG画像を入れる
- c) 色数分の文字データをもってレイヤー合成で表示

今回はこのうち b) 方式のフォントファイルから絵文字の画像を抜きだします。

参考)

- Apple Color Emoji spec
  - https://developer.apple.com/fonts/TrueType-Reference-Manual/RM06/Chap6sbix.html
- Google Noto Color Emoji spec
  - https://rawgit.com/behdad/color-emoji/master/specification/v1.html

本来であれば上記仕様書に従って分解するべきでしょうけど、面倒なので PNG の先頭シグネチャを目印に抜き出しました。

# PNG の構造

<center> <img src="../figure-png.png" /> </center>

# 処理概要

- 1) フォントファイルの先頭から PNG のシグネチャを探す。
- 2) 見つけたら、その後ろのチャンクを順番に見る。
   - len + name + payload + crc の構造
   - len は UInt32(4byte) BigEndiana
   - name は4文字(4byte)。IHDR チャンクで始まり IEND チャンクで終わる
   - チャンクの最後 4byte に crc 値がある事に注意
- 3) IEND のチャンクにたどり着いたら、そこまでを一つの PNGファイルとして出力する。
- 4) 1 に戻る

# ツール take1

(すみません、PHP で。。)

- https://github.com/yoya/misc/blob/96452d7ddbe797685728a5825df2cf3ca863c80c/php/pngextract.php

PNG の先頭シグネチャは以下の8バイトです。
```
$pngSignature = "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A";
```
このシグネチャを探して、チャンクを IEND まで辿る処理
```
$startOffset = strpos($data, $pngSignature, $offset);
$offset = $startOffset + strlen($pngSignature);
$iendFound = false;
while (($offset + 8) < $dataLen) {
    $len = readUI32($data, $offset);
    $sig = substr($data, $offset + 4 , 4);
    $offset += 4 + 4 + $len + 4; // len + name + <payload> + crc
    if ($sig === "IEND") {
        $iendFound = true;
        break;
    }
}
```

## 実行例

- NotoSans Color Emoji
```
$ php pngextract.php  -f NotoColorEmoji.ttf -p notoemoji
notoemoji000000.png
notoemoji000001.png
notoemoji000002.png
＜略＞
notoemoji002384.png
notoemoji002385.png
notoemoji002386.png
OK
$
```
<center> <img src="../notoemoji-ss.png" /> </center>

- Apple Color Emoji
```
$ php pngextract.php -f /System/Library/Fonts/Apple\ Color\ Emoji.ttf -p appleemoji
appleemoji000000.png
appleemoji000001.png
appleemoji000002.png
＜略＞
appleemoji009538.png
appleemoji009539.png
appleemoji009540.png
OK
```

<center> <img src="../appleemoji-ss.png" /> </center>

無条件で PNG を吸い出しているので、絵文字以外の画像も取れるかもしれませんが、ご愛嬌という事で。

## ファイルストリーム方式

上記のプログラムでは file_get_contents でファイルの全データをメモリに載せているので、数GB といったファイルの処理には適しません。動かない可能性も高いです。

ファイルストリームで処理する版に改良しました。

- https://github.com/yoya/misc/blob/14686cfdb14e3859605710488a2ddd6a63a965de/php/pngextract.php

```
$fp = fopen($file, "rb");
for ($i = 0 ; searchText($fp, $pngSignature); $i++) {
     $outputFilename = sprintf("%s%06d.png", $prefix, $i);
    echo "$outputFilename\n";
    $fp_out = fopen($outputFilename, "wb");
    fwrite($fp_out, $pngSignature);
    $iendFound = false;
    while (($len_name = fread($fp, 8)) !== false) {
        fwrite($fp_out, $len_name);
        $len = readUI32(substr($len_name, 0, 4));
        $name = substr($len_name, 4, 4);
        $payload_crc = fread($fp, $len + 4);
        if ($payload_crc === false) {
            break;
        }
        fwrite($fp_out, $payload_crc);
        if ($name === "IEND") {
            $iendFound = true;
            break;
        }
    }
＜略＞

```

要するに、入力したデータをなるべく即出力する事で、メモリを省エネ出来ます。

# 最後に

フォントファイルに限らず、PNG データが生のまま埋め込まれているバイナリであれば、それがどんな形式であれ PNG を吸い出せるので便利です。ご活用下さい。
