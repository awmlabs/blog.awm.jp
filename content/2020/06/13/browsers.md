+++
title = "各種ブラウザーの画像フォーマット対応"
date = 2020-06-13T15:44:39+09:00
categories = ["Browser"]
tags = ["Browser", "Image"]
draft = false
+++

# 各種ブラウザーの画像フォーマット対応

## はじめに

- http://yosbits.com/wordpress/?p=1683 画像のブラウザ対応

こちらのテーブルの最新版が欲しかったので、2020年版を作りました。Wikipedia からのほぼコピペです。

- https://en.wikipedia.org/wiki/Comparison_of_web_browsers#Image_format_support

## 対応テーブル

<style>
table { }
tr { color: white; background-color:#666;  }
td { color: black; text-align: center;  padding 0.25rem 0.25rem !important; }
.OK { background-color:#0F4; }
.NG { background-color:#F48; }
</style>

<table>
<tr>
<th>  </th><th> JPEG</th><th> JPEG2000 </th><th> JPEG_XR </th><th> WebP </th><th> GIF </th><th> PNG </th><th> APNG </th> <th> BMP </th><th> HEIF </th>
</tr><tr>
<th> Chrome </th> <td class="OK">O</td> <td class="NG">x</td><td class="NG">x</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td>
</tr><tr>
<th>Firefox </th> <td class="OK">O</td> <td class="NG">x</td><td class="NG">x</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td>
</tr><tr>
<th>新 Edge </th> <td class="OK">O</td> <td class="NG">x</td><td class="NG">x</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td>
</tr><tr>
<th> Safari </th> <td class="OK">O</td> <td class="OK">O</td><td class="NG">x</td> <td class="NG">X</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td>
</tr><tr>
<th>旧 Edge </th> <td class="OK">O</td> <td class="NG">x</td><td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td> <td class="OK">O</td> <td class="NG">x</td>
</tr><tr>
<th>IE11 </th> <td class="OK">O</td> <td class="NG">x</td><td class="OK">O</td> <td class="NG">x</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td>  <td class="OK">O</td> <td class="NG">x</td>
</tr><tr>
<th> image </th> <td><img src="../rose.jpg"></td> <td><img src="../rose.jp2"></td> <td><img src="../rose.jxr"></td> <td><img src="../rose.webp"></td> <td><img src="../rose.gif"></td> <td><img src="../rose.png"></td> <td><img src="../rose.apng"></td> <td><img src="../rose.bmp"></td> <td><img src="../rose.heic"></td>
</tr>
</table>

- ここでいう、新 Edge は Chromium 版 Edge 、旧 Edge はそれ以前の MS 独自実装のブラウザを示します。

# 備考

- Wikipedia では Safari が JPEG2000 対応をやめたとありますが、実際には表示できます。恐らく Windows 版の話でかつ Windows 版 Safari はもう存在しません。
- Wikipedia では Safari は HEIF 対応としてますが実際には表示できません。WWDC2017 で JPEG は終わり次は HEIF みたいなノリで話してたので誤解したのかも？
- 旧 Edge  の WebP 表示は Win10 1809 更新で対応しました。1803 以前だと表示しません。
- 旧 Edge / IE11 の APNG 表示は最初の一コマ目だけ表示します。恐らく普通の PNG 扱いでしょう。

# 画像ファイル作成

参考までに。ImageMagick と gif2apng を使った各形式の画像作成方法です。


大体の形式は ImageMagick で生成できます。

- https://imagemagick.org/

```
% for f in jpg jp2 jxr webp png bmp ;
    do convert rose: rose.$f ;
    done
% identify  rose.*
rose.bmp BMP 70x46 70x46+0+0 8-bit sRGB 9890B 0.000u 0:00.000
rose.jp2 JP2 70x46 70x46+0+0 8-bit sRGB 0.000u 0:00.000
rose.jpg JPEG 70x46 70x46+0+0 8-bit sRGB 2663B 0.000u 0:00.000
rose.jxr PPM 70x46 70x46+0+0 8-bit sRGB 9673B 0.000u 0:00.000
rose.png PNG 70x46 70x46+0+0 8-bit sRGB 6975B 0.000u 0:00.000
%
```

identify で rose.jxr が PPM と表示されますが、これは変換に失敗したので無く Delegate の都合です。

## JPEG XR

ImageMagick は自前で JPEG XR を処理出来ず、外部コマンドを使って変換します。この仕組みを Delegate と呼びます。

JPEG XR を以下のようにして生成する場合、

```
% convert rose: rose.jxr
```

内部的には jxrlib の JxrEncApp コマンドを以下のように呼び出します。

```
% convert rose: rose.bmp
% JxrEncApp -i rose.bmp -o rose.jxr
```

逆にデコードする際は、JxrDecApp コマンドが呼ばれます。

```
% JxrDecApp  -i rose.jxr -o rose.pnm
```

ImageMagick は JPEG XR を理解できないので、代わりに PPM を解析表示するという事です。

```
% identify  rose.jxr
rose.jxr PPM 70x46 70x46+0+0 8-bit sRGB 9673B 0.000u 0:00.000
```

なお、拡張子の PNM は PPM 以外にも PBM, PGM 等を含めたいくつかの画像形式の総称です。

(参考)

- PNM と ImageMagick で画像ファイルを手作り生成
  - https://blog.awm.jp/2016/01/04/pnm/ 

## animation GIF

```
% for h in  60 120 180 240 ;
    do convert rose.png -modulate 100,100,$h $h.png ;
    done
% convert -delay 100 rose.png ??.png ???.png  rose.gif
% identify rose.gif
rose.gif[0] GIF 70x46 70x46+0+0 8-bit sRGB 256c 0.000u 0:00.000
rose.gif[1] GIF 70x46 70x46+0+0 8-bit sRGB 256c 0.000u 0:00.000
rose.gif[2] GIF 70x46 70x46+0+0 8-bit sRGB 256c 0.000u 0:00.000
rose.gif[3] GIF 70x46 70x46+0+0 8-bit sRGB 256c 0.000u 0:00.000
rose.gif[4] GIF 70x46 70x46+0+0 8-bit sRGB 256c 20982B 0.000u 0:00.000
%
```

ちなみに、ImageMagick の modulate のhue(色相)は 360でなく 300 で一回転します。

##  APNG

ImageMagick は APNG に対応していません。(追記: 2020年10月リリース 7.0.10-31 で APNG も変換できるようになりました。apng:out.png のように指定します)

- https://gif2apng.sourceforge.net/

こちらの gif2png を使うと楽です。

```
% gif2apng  rose.gif  rose.apng

gif2apng 1.9 using 7ZIP with 15 iterations

Reading 'rose.gif'...
5 frames.
Writing 'rose.apng'...
5 frames.
% 
```

## HEIF

ImageMagick が HEIF 生成の為に利用する libheif - x265 は 64x64 を下回るサイズの HEIF は作れません。(空ファイルが出来ます)

```
% convert rose.png rose.heic
convert: Encoder plugin generated an error: Invalid parameter value: Images smaller than 16 pixels are not supported `rose.heic' @ error/heic.c/IsHeifSuccess/136.
% ls -l  rose.heic
-rw-r--r--  1 yoya  devel  0  6 13 22:29 rose.heic
```

macOS のプレビュー.app を使うと簡単に作成できます。

<img src="../rose-heic-making.png">

```
% identify  rose.heic
rose.heic HEIC 70x46 70x46+0+0 8-bit YCbCr 0.000u 0:00.000
```

尚、拡張子は .heic です。ImageMagick で .heif 指定すると、エラーを出さずに失敗します。

```
% convert rose: rose.heif
% identify  rose.heif
rose.heif PPM 70x46 70x46+0+0 8-bit sRGB 9673B 0.000u 0:00.000
```

先ほど、JPEG XR が PPM と表示されるのは Delegate の都合でしたが、
HEIF の場合は rose: が内部的に PPM 形式で、そのまま何も変換しなかったという事です。
