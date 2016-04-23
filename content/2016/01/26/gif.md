+++
categories = ["GIF"]
date = "2016-01-26T14:55:40+09:00"
draft = false
tags = ["GIF", "ImageMagick", "Format"]
title = "ImageMagick で GIF の形式を変換"

+++

# ImageMagick で GIF の形式を変換

GIF は同じように見える画像でも、バイナリ的に色んな形式やメタデータで表現できます。ImageMagick でそれらの形式に変換する方法を並べてみます。

# インターレースGIF
```
$ convert Opaopa.png -interlace GIF Opaopa-interlace.gif
```
<center> <img src="../Opaopa-interlace.gif" /> </center>

### ピクセルの並ぶ順番

- 8行ごとに1行
- 4行ごとに1行
- 2行ごとに1行
- 残り全部

という順でピクセルを保存します。

|ピクセル |実際の表示
---|---
<img src="../Opaopa-dot1-interlace-1.png" /> <img src="../Opaopa-dot8-interlace-1.png" /> | <img src="../Opaopa-dot1-interlace-1-cmpl.png" /> <img src="../Opaopa-dot8-interlace-1-cmpl.png" />
<img src="../Opaopa-dot1-interlace-2.png" /> <img src="../Opaopa-dot8-interlace-2.png" /> | <img src="../Opaopa-dot1-interlace-2-cmpl.png" /> <img src="../Opaopa-dot8-interlace-2-cmpl.png" />
<img src="../Opaopa-dot1-interlace-3.png" /> <img src="../Opaopa-dot8-interlace-3.png" /> | <img src="../Opaopa-dot1-interlace-3-cmpl.png" /> <img src="../Opaopa-dot8-interlace-3-cmpl.png" />
<img src="../Opaopa-dot1.png" /> <img src="../Opaopa-dot8.png" /> | 

ちなみに上記画像は ImageMagick で以下のように生成できます。(-fx オプション便利！)

- インターレースのフェーズ別画像
```
$ convert Opaopa-dot1.png -filter Point -fx "!(j%8)*u" Opaopa-dot1-interlace-1.png
$ convert Opaopa-dot1.png -filter Point -fx "!(j%4)*u" Opaopa-dot1-interlace-2.png
$ convert Opaopa-dot1.png -filter Point -fx "!(j%2)*u" Opaopa-dot1-interlace-3.png
```

-  フェーズ別画像ピクセル補完あり
```
convert Opaopa-dot1.png -filter Point -fx "p{i,j-j%8}" Opaopa-dot1-interlace-1-cmpl.png
convert Opaopa-dot1.png -filter Point -fx "p{i,j-j%4}" Opaopa-dot1-interlace-2-cmpl.png
convert Opaopa-dot1.png -filter Point -fx "p{i,j-j%2}" Opaopa-dot1-interlace-3-cmpl.png
```

- ドット絵風の拡大画像
```
$ convert Opaopa-dot1-interlace-1.png -filter Point -resize 800% -fx "(i%8>0)*(j%8>0)*u" Opaopa-dot8-interlace-1.png
＜略＞
```

# ポジション指定

GIF は描画場所の Screen と実際に描画する Image の位置を別に持るので、その描画場所を指定できます。

```
$ convert Opaopa.png -page +50+30 Opaopa-posi.gif
$ identify Opaopa-posi.gif
Opaopa-posi.gif GIF 120x72 120x72+50+30 8-bit sRGB 16c 999B 0.000u 0:00.000
```
<table><tr><td>
<img src="../Opaopa-posi.gif" style="background-color: black" />
</td></tr>
</table>

上記の画像は table タグの中に入れてますが、(50,30) から描画されます。(ブラウザによって微妙に表示が変わります)

# 透明色

インデックスの一つを透明色として扱えます。尚、半透明は扱えません。

```
$ convert Opaopa.png -transparent "#00d342" Opaopa-transparent.gif
```
<center> <img src="../Opaopa-transparent.gif" /> </center>

# アニメーションGIF

## Delay

## Local Descriptor Table

## dispose



