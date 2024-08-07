+++
categories = ["PNG"]
date = "2016-11-18T17:02:28+09:00"
draft = false
tags = ["PNG"]
title = "任意のファイルから PNG を抜き出す"

+++

# はじめに


Apple Color Emoji や Google のNotoColorEmoji のフォントファイルに内包されている絵文字の PNG 画像データを抽出する事が目的です。

<center> <img src="../figure-ttf.png" /> </center>

# カラー絵文字

カラー絵文字フォントには以下のような種類があります。

- a) フォントにSVG 画像で絵文字を入れる (Mozilla 方式)
- b) ＜同上＞PNG 画像で絵文字を入れる (Apple, Google 方式)
- c) ＜同上＞色数分の文字データをレイヤー合成して絵文字表示 (Microsoft 方式)

今回はこのうち b) 方式のフォントファイル形式を対象にします。

参考)

- Apple Color Emoji spec
  - https://developer.apple.com/fonts/TrueType-Reference-Manual/RM06/Chap6sbix.html
- Google Noto Color Emoji spec
  - https://rawgit.com/behdad/color-emoji/master/specification/v1.html

上記仕様書に従って分解するのが面倒なので、PNG の先頭シグネチャを目印に抜き出す、フォント以外でも利用出来る汎用的なツールを作りました。
絵文字以外の画像も取れるかもしれませんが、ご愛嬌という事で。。

# PNG の構造

<center> <img src="../figure-png.png" /> </center>

# ツール処理概要

- 1) フォントファイルの先頭から PNG のシグネチャを探す。
- 2) 見つけたら、その後ろのチャンクを順番に見る。
   - len + name + payload + crc の構造
       - len は UInt32(4byte) BigEndian
       - name は4文字(4byte)。最初のチャンクが IHDR で、最後が IEND
       - チャンクの末尾 4byte に crc 値がある事に注意
- 3) IEND のチャンクにたどり着いたら、そこまでを一つの PNGファイルとして出力する。
- 4) 1 に戻る

# ツール take1

すみません、PHP で。。。

- https://github.com/yoya/misc/blob/96452d7ddbe797685728a5825df2cf3ca863c80c/php/pngextract.php

PNG の先頭シグネチャは以下の8バイトです。
```
$pngSignature = "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A";
```
このシグネチャを strpos で探して、その後ろに続くチャンクを IEND まで辿る処理を作りました。

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

- (Google) NotoColorEmoji
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
$
```

<center> <img src="../appleemoji-ss.png" /> </center>

Apple の方が PNG ファイルの数(5974 > 2387)が多いけれど、Google の方が画像サイズが大きい(136x128 > 20x20)という違いがありますね。

# ツール take2 (ストリーム方式)

上記のプログラムでは file_get_contents でファイルの全データをメモリに載せているので、ファイルが数GB になると動かない可能性が出てきます。

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

要するに、入力したデータをなるべく即出力する事で、使用メモリを節約できます。

なお、strpos が使えなくなるので、ベタな方法で代価してます。(標準関数で欲しい。。)

```
function searchText($fp, $needle) {
    $len = strlen($needle);
    $buff = fread($fp, $len);
    if ($buff === false)  {
        return false;
    }
    while (($buff !== $needle)) {
        if (feof($fp)) {
            return false;
        }
        $c = fread($fp, 1);
        if ($c === false) {
            return false;
        }
        $buff = substr($buff, 1) . $c;
    }
    return true;
}
```

文字列検索はアルゴリズム的に頑張る余地がありますが、今後の課題にしておきますね。

# 最後に

以上。

フォントファイルに限らず、PNG データが生のまま埋め込まれているバイナリであれば、どんな形式からでも PNG データを吸い出せるので便利です。ご活用下さい。

# 参考 URL

- Firefox Developers Conference 2014 in Kyotoのライトニングトークの資料
  - http://wontfix.blogspot.jp/2014/04/firefox-developers-conference-2014-in.html
- Apple Color Emoji
  - https://en.wikipedia.org/wiki/Apple_Color_Emoji
- Open Standard Color Font Fun for Everyone
  - https://opensource.googleblog.com/2013/05/open-standard-color-font-fun-for.html
- Color fonts. Overview of the proposals for color extensions of the OpenType font format.
   - http://blog.fontlab.com/font-tech/color-fonts/color-font-format-proposals/
