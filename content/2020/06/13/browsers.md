+++
title = "ブラウザーの画像形式対応"
date = 2020-06-13T15:44:39+09:00
categories = ["Browser"]
tags = ["Browser", "Image"]
draft = false
+++

# ブラウザーの画像形式対応

- http://yosbits.com/wordpress/?p=1683 画像のブラウザ対応

こちらの最新版が欲しかったので、2020年版を作りました。Wikipedia からのほぼコピペです。

<style>
tr { color: white; background-color:#666; }
td { color: black; text-align: center; }
.OK { background-color:#0F4; }
.NG { background-color:#F24; }
</style>

<table>
<tr>
<th>Br \ Im</th><th> JPEG</th><th> JPEG2000 </th><th> JPEG_XR </th><th> WebP </th><th> GIF </th><th> PNG </th><th> APNG </th><th> TIFF </th><th> BMP </th><th> HEIF </th>
</tr><tr>
<th> Chrome </th> <td class="OK">O</td> <td class="NG">x</td><td class="NG">x</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td> <td class="OK">O</td> <td class="NG">x</td>
</tr><tr>
<th> Safari </th> <td class="OK">O</td> <td class="OK">O</td><td class="NG">x</td> <td class="NG">X</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td> <td class="OK">O</td> <td class="NG">x</td>
</tr><tr>
<th>Firefox </th> <td class="OK">O</td> <td class="NG">x</td><td class="NG">x</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td> <td class="OK">O</td> <td class="NG">x</td>
</tr><tr>
<th>IE 11 </th> <td class="OK">O</td> <td class="NG">x</td><td class="OK">O</td> <td class="NG">x</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td> <td class="OK">O</td> <td class="OK">O</td> <td class="NG">x</td>
</tr><tr>
<th> image </th> <td><img src="../rose.jpg"></td> <td><img src="../rose.jp2"></td> <td><img src="../rose.jxr"></td> <td><img src="../rose.webp"></td> <td><img src="../rose.gif"></td> <td><img src="../rose.png"></td> <td><img src="../rose.apng"></td> <td><img src="../rose.tiff"></td> <td><img src="../rose.bmp"></td> <td><img src="../rose.heif"></td>
</tr>
</table>

# 備考

- Wikipedia では Safari が JPEG2000 対応を辞めたとありますが、恐らく Windows 版の話でかつ Windows 版はもう停止してます。 macOS 版は表示されます。
- Wikipedia では Safari が HEIF 対応のように書いてますが、実際には対応していません。WWDC17 では JPEG は終わりみたいな話してましたし、iOS11 対応予定を Safari11 対応と見間違えたのかも？






