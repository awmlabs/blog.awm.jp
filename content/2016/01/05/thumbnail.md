+++
categories = ["Graphics"]
date = "2016-01-05T22:59:30+09:00"
draft = false
tags = ["Graphics", "ImageMagick", "Thumbnail", "Compose", "Icon"]
title = "ImageMagick でサムネール画像生成"
+++

# ImageMagick でサムネール画像生成

初めて ImageMagick でサムネール画像を作成する人向けの簡単な紹介です。

ImageMagick の convert コマンドでリサイズするのに色んなオプションがあって、自分は -resize を使う事が多いですが、今回は余計なメタデータを削除してくれる -thumbnail を使ってみます。

オリジナル画像はこちらをを使います。
<center> <img src="/2016/01/05/saitama.jpg" alt="saitama" /> </center>

# とりあえず小さくする

手始めに適当なサイズ 100x100 を指定してサムネールを作ります。

```
$ convert  saitama.jpg -thumbnail 100x100 saitama_100x100.jpg
```
<center> <img src="/2016/01/05/saitama_100x100.jpg" alt="100x100" /></center>

良い感じに変換してくれますが、100x100 を指定したのに 100x76 画像が生成される事に戸惑うでしょう。

```
$ identify saitama_100x100.jpg
saitama_100x100.jpg JPEG 100x76 100x76+0+0 8-bit sRGB 3.57KB 0.000u 0:00.000
```

単純に 100x100 を指定すると、アスペクト比(縦と横の比率)が変わらないよう調整される為です。

# リサイズ後のサイズを 100x100 にする

アスペクト比を無視して、確実に 100x100 にしたい場合は 100x100! のように後ろに ! をつけます。

```
$ convert  saitama.jpg -thumbnail 100x100! saitama_100x100f.jpg
```
<center> <img src="/2016/01/05/saitama_100x100f.jpg" alt="100x100!" /></center>

しかしこれは、恐らく望む結果ではないはずです。

# アスペクト比を変えずに 100x100 にする

そんな矛盾した要求を。。。と一瞬怯みますが、２つ方法を思いつきます。

## 削ってしまう

先程の 100x100 指定では縦と横のうち大きい辺を 100 にして、アスペクト比が変わらないように小さな辺を算出しました。

その逆で、小さい方の辺を 100 にして、アスペクト比固定で 100 を超える大きな辺を作り、その画像の左右または上下を削って 100 に切り詰めるという戦略が取れます。

```
$ convert saitama.jpg -thumbnail 100x100^ -gravity center \
	-extent 100x100 saitama_100x100crop.jpg
```
<center> <img src="/2016/01/05/saitama_100x100crop.jpg" alt="100x100crop" /></center>

## 余白をつける

左右の子達が見切れて可哀想。削っちゃ嫌だ！という要望に応えて削らない方法もあります。余白をつけて適当な色で埋めれば可能です。

```
$ convert saitama.jpg -thumbnail 100x100 -gravity center \
	-extent 100x100 saitama_100x100extent.jpg
```
<center> <img src="/2016/01/05/saitama_100x100extent.jpg" alt="100x100extent" /></center>

余白の色が白で見えにくいので、-background で黒を指定してみます。

```
$ convert saitama.jpg -thumbnail 100x100 -background black \
	-gravity center -extent 100x100 saitama_100x100black.jpg
```
<center> <img src="/2016/01/05/saitama_100x100black.jpg" alt="100x100black" /></center>

# 丸いアイコン風画像の作り方

最後に、サムネールとは少し異なりますが丸いアイコン風画像の作り方も紹介します。

尚、円の外側は透明にしたいので、今回は png を生成します。

まずは、convert の -draw オプションで丸のクリップ用画像を作ります。

```
$ convert -size 100x100 xc:none -fill white -draw "circle 50,50,50,0" \
	circle_mask.png
```
<center> <img src="/2016/01/05/circle_mask.png" alt="circle_mask" /></center>


-compose CopyOpacity を使いクリップ画像を指定する事でクリップが出来ます。

```
$ convert saitama.jpg -thumbnail 100x100 -background white -extent 100x100 \
	circle_mask.png -compose CopyOpacity -composite saitama_icon.png
```
<center> <img src="/2016/01/05/saitama_icon.png" alt="icon" /></center>

## 一行にまとめる

カッコを使って入れ子に出来ます。

```
$ convert saitama.jpg -thumbnail 100x100 -background white -extent 100x100 \
  \( -size 100x100 xc:none -fill white -draw "circle 50,50,50,0" \) \
  -compose CopyOpacity -composite saitama_icon.png
```

画像は同じ結果なので省略します。

# 最後に

リサイズする時にぼやけたり、色味が物足りなかったり、追加でフィルタをかけたかったりといった時のケアも大事で、ImageMagick なら対応出来ますが、それはまた今度説明します。

# 参考 URL

 * http://www.imagemagick.org/Usage/masking/
 * http://www.imagemagick.org/script/command-line-processing.php#geometry
 * Imagemagick - Ways of cropping an image to a circle (or other shape).
   * http://daemonsandagents.tumblr.com/post/108369306151/imagemagick-ways-of-cropping-an-image-to-a
 * ImageMagickで画像をリサイズする時のメモ
   * http://o.inchiki.jp/obbr/125
