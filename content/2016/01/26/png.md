+++
categories = ["PNG"]
date = "2016-01-26T14:55:42+09:00"
draft = false
tags = ["PNG", "ImageMagick", "Format"]
title = "ImageMagick で PNG の形式を変換"
+++


# ImageMagick で PNG の形式を変換

PNG は同じように見える画像でも、バイナリ的に色んな形式で表現できます。ImageMagick でそれらの形式に変換する方法を並べてみます。

# カラータイプ

PNG は以下の5種類のカラータイプがあります。仕様書からコピペします。

Color  Type | Allowed Bit Depths | Interpretation
----|----|----
0 | 1,2,4,8,16 | Each pixel is a grayscale sample.
2 |       8,16 | Each pixel is an R,G,B triple.
3 | 1,2,4,8    | Each pixel is a palette index; a PLTE chunk must appear.
4 |       8,16 | Each pixel is a grayscale sample, followed by an alpha sample.
6 |       8,16 | Each pixel is an R,G,B triple, followed by an alpha sample.

日本語に訳しつつ、いくつか情報を追記してみます。

カラー型 | ビット<br />深度 | PLTE | tRNS | ピクセル値の解釈
----|----|----|----|----
0 | 1,2,4,8,16 |  ×  | ○ | <img src="../png-pixel-type0.png" /> グレースケール
2 |       8,16 |  ○  | ○ | <img src="../png-pixel-type2.png" /> R,G,B (PNG24)
3 | 1,2,4,8    |必須○| ○ | <img src="../png-pixel-type3.png" /> インデックスカラー。(PNG8)
4 |       8,16 |  ×  | × | <img src="../png-pixel-type4.png" /> グレースケールの後ろにアルファ値。つまり YA
6 |       8,16 |  ○  | × | <img src="../png-pixel-type6.png" /> R,G,B の後ろにアルファ値。つまり RGBA　(PNG32)

## Type:0 グレースケール

 黒:0〜白:2^(bit数)の範囲の値を並べるだけの形式です。
bit数は 1,2,4,8,16 から選択できます。
<center> <img src="../png-type0.png" /> </center>

```
$ convert Opaopa.png -type Grayscale Opaopa-type0.png
```

 * 尚、tRNS チャンクをつける事で透明ピクセルも表現できます。

## Type:2 RGB (PNG24)

ピクセルの R,G,B をそのまま展開します。
<center> <img src="../png-type2.png" /> </center>

```
$ convert Opaopa.png png24:Opaopa-png24.png
```

 * tRNS チャンクをつける事で透明ピクセルも表現できます。但し、どの色を透明にするかを指定する方式なので、透明か不透明のどちらかで半透明は表現できません。大人しく Type 6 の RGBA 形式を使いましょう。
 * PLTE チャンクをつける事で擬似カラー端末で表示する時のパレットを指定できます。今時レアですが。(sPLT とおなじ？)

## Type:3 パレット (PNG8)

色のパレットを持ち、そこへのインデックス値を並べて画像を表現します。
<center> <img src="../png-type3.png" /> </center>

```
$ convert Opaopa.png  png8:Opaopa-png8.png
```
tRNS チャンクをつける事で透明度も表現できます。

## Type:4 透明度つきグレースケール

グレースケールの値と透明度のセットで表現します。
<center> <img src="../png-type4.png" /> </center>
```
$ convert Opaopa.png -type GrayscaleMatte  Opaopa-type4.png
```

## Type:6 RGBA (PNG32)

ピクセルの R,G,B,A を展開します。
<center> <img src="../png-type6.png" /> </center>
```
$ convert Opaopa.png  png32:Opaopa-png32.png
```

# メタデータ

## gAMA (ガンマ補正)

単純にガンマ値を指定します。

## cHRM (基本色度)

基本色度やホワイトバランスを指定します。
尚、sRGB 又は iCPP チャンクがある場合、cHRM チャンクは無効です。

## iCPP (ICC プロファイル)

ICC プロファイルを埋め込めます。 (JPEG と同じ要領です)

```
$ convert Opaopa.png -profile sRGB.icc Opaopa-sRGB.png
```
<center> <img src="../Opaopa-sRGB.png"> </center>

```
$ convert Opaopa.png -profile GBR.icc Opaopa-GBR.png
```
<center> <img src="../Opaopa-GBR.png"> </center>
```
$ convert Opaopa-sRGB.png -profile GBR.icc Opaopa-sRGB-GBR.png
```
<center> <img src="../Opaopa-sRGB-GBR.png"> </center>

```
$ convert Opaopa-sRGB-GBR.png -strip Opaopa-sRGB-GBR-strip.png
```
<center> <img src="../Opaopa-sRGB-GBR-strip.png"> </center>

JPEG の時と同じのようです。

 * 元画像ファイルに ICC プロファイルがない場合
    *  => 単に ICC プロファイルを付けるだけ
 * ICC プロファイルがあった場合 => 見た目の色が変わらないよう画像データのRGBを書き換えつつ ICCプロファイルを上書きする

## bKGD (背景色)

背景色を指定します。画像が貼られた時に埋まらなかったピクセルを埋める色です。

# メタデータ (おまけ)

## pHYs

DPI ならぬ DPM (インチでなくメートル単位) で物理的な解像度を指定します。印刷に影響するかもしれません。

## sBIT

元画像データの Bit深度を記録します。
恐らく、任意のビット深度を表現できる画像データ(例えば BMP とか)から PNG に変換した後で、また元のビット深度に戻したいといった場合に使えるようです。ビット深度を下げるような変換をした場合はつけないよう勧めています。意味ないので。

# 参考 URL

 * PNG (Portable Network Graphics) Specification, Version 1.2
   * http://www.libpng.org/pub/png/spec/1.2/png-1.2.pdf
 * PNGについて
   * http://homepage2.nifty.com/sophia0/png.html
 * JPG ファイルフォーマット
   * http://www.setsuki.com/hsp/ext/jpg.htm

