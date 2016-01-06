+++
categories = ["ImageMagick"]
date = "2016-01-06T19:52:03+09:00"
draft = false
tags = ["Exif", "Orientation", ""]
title = "ImageMagick の -auto-orient でオフセットがズレる件"

+++

# -auto-orient でオフセットがズレる件

例のエントリにもう一件便乗。

* もうサムネイルで泣かないための ImageMagick ノウハウ集
   * http://blog.cybozu.io/entry/2016/01/06/080000

```
ただ、ImageMagick といえど Orientation 画像の変換でちょっと怪しい挙動があります。
上記サンプル画像の right-mirrored.jpg を -auto-orient をつけて png に変換すると、
offset 情報がおかしくなります。

$ convert right-mirrored.jpg -auto-orient out.png
$ identify out.png
out.png PNG 480x640 640x480+160+4294967136 8-bit PseudoClass 256c 13.8KB 0.000u 0:00.000
このケースは -auto-orient をつけて一度 JPEG に変換し、
改めて PNG に変換すると正しい情報の画像が得られます。
```

4294967136 はバイナリ的には2の補数表現の -160 と同等なので単純に表示が壊れている(%d と %u の違い)と思います。結論を先に言うと +repage を使ってみてはどうでしょうという提案です。

# 実装

さて、どうして +160-160 になるのか。

 * AutoOrientImage: http://gt.awm.jp/ImageMagick-6.9.3-0/S/1339.html#L79
 * RotateImage: http://gt.awm.jp/ImageMagick-6.9.3-0/S/1261.html#L2787

要するに汎用の Rotate ルーチンを呼び出します。汎用なので斜めの回転ではみ出る可能性があり、自動で描画領域を広げる処理があります。

ちなみに、自分が手元で convert を動かすとこうなります。

```
$ convert right-mirrored.jpg -auto-orient out.png
$ identify out.png
out.png PNG 480x640 640x480+160-160 8-bit sRGB 256c 13.9KB 0.000u 0:00.000
```

座標から想像するに、右下を軸に回転してしまっていると予想されます。

<center> <img src="/2016/01/06/1.jpg" /> </center>

画像を単独で表示する分には気になりませんが、例えば HTML ドキュメントにレイアウトされる場合、期待する場所は左下で、実際には右上の方にズレて配置されるかもしれません。

<center> <img src="/2016/01/06/2.jpg" /> </center>

# +repage

ImageMagick の draw 命令や GIF アニメーションでコマ分割等をする人には馴染みがありますが、今回のように表示上の左上を原点として仕切り直すのに +repage オプションが使えます。

```
$ convert right-mirrored.jpg -auto-orient +repage out-repage.png
$ identify out-repage.png
out-repage.png PNG 480x640 480x640+0+0 8-bit sRGB 256c 13.9KB 0.000u 0:00.000
```

という感じで、+repage で良いのではという提案でした。

# おまけ

実は手元の MacOSX で検証していて気づいたのですが、 . MacPorts の ImageMagick で変換すると 640x480+160-160 になりますが、自分でコンパイルした ImageMagick で変換すると(+repageつけなくても) 480x640+0+0 になります。

* MacPorts の configure オプションをギリギリまで削ったもの

```
./configure LDFLAGS=-L/opt/local/lib CPPFLAGS=-I/opt/local/include
```

* 自分でコンパイルしたもの
```
./configure --with-png=/usr/local/Cellar/libpng/1.6.18/
```

どうやら libpng 次第で挙動が変わる模様。バージョンのせいか Homebrew の libpng だからなのかは分かりませんが、調べるのは少し骨が折れそうです。気が向いたらもう少し追います。
