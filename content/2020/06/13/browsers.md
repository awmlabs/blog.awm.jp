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
.NG { background-color:#F24; }
</style>

<table>
<tr>
<th>  </th><th> JPEG</th><th> JPEG2000 </th><th> JPEG_XR </th><th> WebP </th><th> GIF </th><th> PNG </th><th> APNG </th> <th> BMP </th><th> HEIF </th>
</tr><tr>
<th> Chrome </th> <td class="OK">O</td> <td class="NG">x</td><td class="NG">x</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td>
</tr><tr>
<th>Firefox </th> <td class="OK">O</td> <td class="NG">x</td><td class="NG">x</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td>
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

# 備考

- Wikipedia では Safari が JPEG2000 対応をやめたとありますが、実際には表示できます。恐らく Windows 版の話でかつ Windows 版 Safari はもう存在しません。
- Wikipedia では Safari は HEIF 対応としてますが実際には表示できません。WWDC2017 で JPEG は終わり次は HEIF みたいなノリで話してたので誤解したのかも？
- IE11 の WebP 表示は Win10 1809 更新で対応しました。1803 以前だと表示しません。
- IE11 の APNG 表示は最初の一コマ目だけ表示します。恐らく普通の PNG 扱いでしょう。

# 画像ファイル作成

参考までに。ImageMagick と gif2apng を使った各形式の画像作成方法です。

- https://imagemagick.org/
- https://gif2apng.sourceforge.net/

```
% for f in jpg jp2 jxr webp png tif bmp ;
    do convert rose: rose.$f ;
    done
% identify  rose.*
rose.bmp BMP 70x46 70x46+0+0 8-bit sRGB 9890B 0.000u 0:00.000

rose.jp2 JP2 70x46 70x46+0+0 8-bit sRGB 0.000u 0:00.000
rose.jpg JPEG 70x46 70x46+0+0 8-bit sRGB 2663B 0.000u 0:00.000
rose.jxr PPM 70x46 70x46+0+0 8-bit sRGB 9673B 0.000u 0:00.000
rose.png PNG 70x46 70x46+0+0 8-bit sRGB 6975B 0.000u 0:00.000
rose.tif TIFF 70x46 70x46+0+0 8-bit sRGB 9924B 0.000u 0:00.000
%
```

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

ImageMagick が HEIF 生成の為に利用する libheif は 64x64 を下回るサイズの HEIF は作れません。(空ファイルが出来ます)

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

尚、拡張子は .heic です。ImageMagick で .heif 指定ですると、エラーを出さずに失敗します。

```
% convert rose: rose.heif
% identify  rose.heif
rose.heif PPM 70x46 70x46+0+0 8-bit sRGB 9673B 0.000u 0:00.000
```

rose: は内部的に PPM 形式なので、つまり何も変換しなかったという事です。
