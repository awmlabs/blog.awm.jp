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

という順でピクセルを保存する事で、ネットワークが遅い場合でも始めに全体像を表示してから、データが取得でき次第少しずつ細部を表示できます。

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

各コマの画像を作って convert で繋いで作成できます。

<center> <img src="../Opaopa-anime-dot1-0.png" /> <img src="../Opaopa-anime-dot1-1.png" /> <img src="../Opaopa-anime-dot1-2.png" /> <img src="../Opaopa-anime-dot1-3.png" /> <img src="../Opaopa-anime-dot1-4.png" /> <img src="../Opaopa-anime-dot1-5.png" /> <img src="../Opaopa-anime-dot1-6.png" /> <img src="../Opaopa-anime-dot1-7.png" />  </center>

```
$ convert Opaopa-anime-dot1-[0-7].png Opaopa-anime-dot1.gif
```
<center> <img src="../Opaopa-anime-dot1.gif" /> </center>
ついでに拡大バージョン
<center> <img src="../Opaopa-anime-dot8.gif" /> </center>

```
$ for n in `seq 0 7`
do convert Opaopa-anime-dot1-$n.png -filter Point -resize 800% -fx "(i%8>0)*(j%8>0)*u" Opaopa-anime-dot8-$n.png
done
$ convert Opaopa-anime-dot8-[0-7].png Opaopa-anime-dot8.gif
```

## Delay

-delay オプションでコマ間の時間を指定できます。1/100 単位なので、例えば -delay 100 を指定すると 1 frame/sec です。

```
$ convert -delay 100  Opaopa-anime-dot8.gif Opaopa-anime-dot8-delay100.gif
$ convert -delay  25  Opaopa-anime-dot8.gif Opaopa-anime-dot8-delay25.gif
```
<center> <img src="../Opaopa-anime-dot8-delay100.gif" /> </center>
<center> <img src="../Opaopa-anime-dot8-delay25.gif" /> </center>

(-delay を入力画像より前に置かないと反映されない事に注意)

## ループ回数

```
$ convert -delay 50 -loop 1 Opaopa-anime-dot8.gif Opaopa-anime-dot8-loop1.gif
```
<center> <a href="../Opaopa-anime-dot8-loop1.gif" /> <img src="../Opaopa-anime-dot8-loop1.gif" /> </a> <br /> ↑ クリックして開けます </center>

## Global or Local ColorMap

ImageMagick のコマンドで Global と Local を判別する方法が分からないので、giftext を使ってみます。giflib もしくは giflib-tools でコマンドをインストール出来ます。[^1]

```
$ convert Opaopa-anime-dot8-[0-7].png Opaopa-anime-dot8.gif
$ giftext Opaopa-anime-dot8.gif | grep "Color Map"
  Has Global Color Map.
  No Image Color Map.
  No Image Color Map.
  No Image Color Map.
  No Image Color Map.
  No Image Color Map.
  No Image Color Map.
  No Image Color Map.
  No Image Color Map.
  Image Has Color Map.
```
今回は１コマ目で使う色パレットで、全部のコマの色を表現できるので Global Color Map １つのみになります。途中のコマで色が増える場合は Local Color Map が生成されます。

尚、コマ毎にバラバラに Local Color Map を持つ場合、+map オプションを使う事で、全コマの Color Map を Global Color Map にまとめられます。

## Optimize

### OptimizeFrame

変化のあるピクセルを全部囲う四角(いわゆる Dirty Rectangle)でクロップした画像を持つ事で、GIF のデータサイズを減らせます。

```
$ convert  Opaopa-anime-dot1.gif  -layers OptimizeFrame Opaopa-anime-dot1-optframe.gif
$ identify Opaopa-anime-dot1-optframe.gif
Opaopa-anime-dot1-optframe.gif[0] GIF 41x18 41x18+0+0 8-bit sRGB 16c 16.4KB 0.000u 0:00.000
Opaopa-anime-dot1-optframe.gif[1] GIF 15x5 41x18+4+7 8-bit sRGB 16c 16.4KB 0.000u 0:00.000
Opaopa-anime-dot1-optframe.gif[2] GIF 14x7 41x18+3+6 8-bit sRGB 16c 16.4KB 0.000u 0:00.000
Opaopa-anime-dot1-optframe.gif[3] GIF 8x7 41x18+6+6 8-bit sRGB 16c 16.4KB 0.000u 0:00.000
Opaopa-anime-dot1-optframe.gif[4] GIF 8x7 41x18+6+6 8-bit sRGB 16c 16.4KB 0.000u 0:00.000
Opaopa-anime-dot1-optframe.gif[5] GIF 5x3 41x18+5+8 8-bit sRGB 16c 16.4KB 0.000u 0:00.000
Opaopa-anime-dot1-optframe.gif[6] GIF 15x3 41x18+4+8 8-bit sRGB 16c 16.4KB 0.000u 0:00.000
Opaopa-anime-dot1-optframe.gif[7] GIF 16x5 41x18+3+7 8-bit sRGB 16c 16.4KB 0.000u 0:00.000
```
<center> <img src="../Opaopa-anime-dot1-optframe.gif"> </center>
<center> <img src="../Opaopa-anime-dot8-optframe.gif"> </center>

コマを分解します。

```
$ convert Opaopa-anime-dot1-opttrans.gif Opaopa-anime-dot1-opttrans-%d.png
```

|元画像 |フレーム最適化
---|---
<img src="../Opaopa-anime-dot8-0.png"> | <img src="../Opaopa-anime-dot8-optframe-0.gif">
<img src="../Opaopa-anime-dot8-1.png"> | <img src="../Opaopa-anime-dot8-optframe-1.gif">
<img src="../Opaopa-anime-dot8-2.png"> | <img src="../Opaopa-anime-dot8-optframe-2.gif">
<img src="../Opaopa-anime-dot8-3.png"> | <img src="../Opaopa-anime-dot8-optframe-3.gif">
<img src="../Opaopa-anime-dot8-4.png"> | <img src="../Opaopa-anime-dot8-optframe-4.gif">
＜以下 5-7 は省略＞

### Optimize Transparency

```
$ convert  Opaopa-anime-dot8.gif  -layers OptimizeTransparency Opaopa-anime-dot8-opttrans.gif
```
<center> <img src="../Opaopa-anime-dot1-opttrans.gif"> </center>
<center> <img src="../Opaopa-anime-dot8-opttrans.gif"> </center>

コマを分解します。

```
$ convert Opaopa-anime-dot1-opttrans.gif Opaopa-anime-dot1-opttrans-%d.gif
```

|元画像 |透明最適化
---|---
<img src="../Opaopa-anime-dot8-0.png"> | <img src="../Opaopa-anime-dot8-opttrans-0.png" style="background-color:black">
<img src="../Opaopa-anime-dot8-1.png"> | <img src="../Opaopa-anime-dot8-opttrans-1.png" style="background-color:black">
<img src="../Opaopa-anime-dot8-2.png"> | <img src="../Opaopa-anime-dot8-opttrans-2.png" style="background-color:black">
<img src="../Opaopa-anime-dot8-3.png"> | <img src="../Opaopa-anime-dot8-opttrans-3.png" style="background-color:black">
<img src="../Opaopa-anime-dot8-4.png"> | <img src="../Opaopa-anime-dot8-opttrans-4.png" style="background-color:black">
＜以下 5-7 は省略＞
(分かりやすくする為に透明部を黒にしてます)
１つ前のコマと色が変わらないピクセルを透明にする事で、色数を減らして圧縮の効率が上がるのが期待出来ます。

### (最強の) Optimize

それらが合わさり最強になった Optimize がこれです。

```
$ convert Opaopa-anime-dot1.gif -layers Optimize Opaopa-anime-dot1-optimize.gif
```
<center> <img src="../Opaopa-anime-dot1-optimize.gif"> </center>
<center> <img src="../Opaopa-anime-dot8-optimize.gif"> </center>

分解します。

|元画像 |最適化
---|---
<img src="../Opaopa-anime-dot8-0.png"> | <img src="../Opaopa-anime-dot8-optimize-0.gif">
<img src="../Opaopa-anime-dot8-1.png"> | <img src="../Opaopa-anime-dot8-optimize-1.gif">
<img src="../Opaopa-anime-dot8-2.png"> | <img src="../Opaopa-anime-dot8-optimize-2.gif">
<img src="../Opaopa-anime-dot8-3.png"> | <img src="../Opaopa-anime-dot8-optimize-3.gif">
<img src="../Opaopa-anime-dot8-4.png"> | <img src="../Opaopa-anime-dot8-optimize-4.gif">
＜以下 5-7 は省略＞

# 参考 URL

- ImageMagick v6 Examples -- Animation Optimization
  - http://www.imagemagick.org/Usage/anim_opt/


[^1]: 公式ページでは giftrans を使って説明してます > http://www.imagemagick.org/Usage/anim_opt/#colortables