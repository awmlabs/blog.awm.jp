+++
categories = ["ImageMagick"]
date = "2016-01-25T02:01:09+09:00"
draft = false
tags = ["Transparent", "JPEG", "ImageMagick"]
title = "透明度を含む画像を JPEG に変換する時の背景色"

+++

#
## -extent で背景を白にできる？

<pre>
$ convert in.png -resize 200x200 out.jpg <img src="../logoblack_hh.jpg" />
$ convert in.png -resize 200x200 -extent 200x200 out.jpg <img src="../logowhite_hh.jpg" />
</pre>

 * -extent は本来キャンバスの拡大命令。
<pre>
$ convert in.png -resize 200x200 –extent 400x400 out.jpg <img src="../logowhiteExtent_hh.jpg" />
</pre>

## -flatten (レイヤーを重ねる命令)が正しい

-background も有効です。

<pre>
$ convert in.png -resize 200x200 –flatten out.jpg <img src="../logowhite_hh.jpg" />
$ convert in.png -resize 200x200 -background red –flatten out.jpg <img src="../logored_hh.jpg" />
</pre>
