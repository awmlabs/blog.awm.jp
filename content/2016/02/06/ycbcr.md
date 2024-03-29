+++
categories = ["JPEG"]
date = "2016-02-06T15:58:53+09:00"
draft = false
tags = ["JPEG", "YCbCr", "YUV"]
title = "JPEG の YCbCr について"

+++

# JPEG の YCbCr について

JPEG で保存する色は RGB でなく YCbCr なので、その話。

# RGB <=> YCbCr

RGB は Red(赤)、Green(緑)、Blue(青)の加色混合で色を表現する方式ですが、JPEG は YCbCr で色を保存します。Y (輝度)、Cb(青の色差)、Cr(赤の色差)です。

Y は色空間の CIE-XYZ で輝度に対応する Y 軸。Cb は Chroma(色度) の Blue, Cr は Red です。

大雑把にはこんなイメージ。
<center> <img src="../ycbcrvolume.png" /> </center>

 * スライダーで色を調整するデモを作りました。お試し下さい。
   * http://blog.awm.jp/color/ycbcrslider.html

## 変換式

### RGB => YCbCr
   |   |   | 
---|---|---|---
Y  | 輝度信号             |  0.299  * R + 0.587  * G + 0.114  * B       |
Cb | 青の色差 <br> (B'-Y) | -0.1687 * R - 0.3313 * G + 0.5    * B + 128 |
Cr | 赤の色差 <br> (R'-Y) |  0.5    * R - 0.4187 * G - 0.0813 * B + 128 |

###  YCbCr => RGB
   |   |   | 
---|---|---|---
R |赤 <br> (Y       + Cr') | Y                        + 1.402   * (Cr - 128) |
G |緑 <br> (Y - Cb' - Cr') | Y - 0.34414 * (Cb - 128) - 0.71414 * (Cr - 128) |
B |青 <br> (Y + Cb'      ) | Y + 1.772   * (Cb - 128)                        |

## RGB との比較

### RGB チャネル分解

<center> <img src="../logo.png" /> </center>
```
$ convert logo.png -colorspace RGB -separate +append tmp.png
$ convert logo.png +level-colors Red \
	\( +clone +level-colors Green1 \) \
	\( +clone +level-colors Blue \) +append \
	tmp.png -compose Multiply -composite  logo_rgb.png
```
注) Green1 を Green にすると緑の明るさが半分になるので注意
<center> <img src="../logo_rgb.png" /> </center>

### YCbCr チャネル分解

こちらは Golang の image パッケージで変換。

 * https://gist.github.com/yoya/4fae336a34a8a5bf5d9c

```
$ go build png_separate_ycbcr.go
$ ./png_separate_ycbcr logo.png logo_ycbcr.png
```
<center> <img src="../logo_ycbcr.png" /> </center>
(YCbCr の残りパラメータを128固定にして擬似的に負の値を表現)

## メリット

輝度信号と色差信号を分けるメリットですが。

 * 白黒テレビの信号に後付けで色味を追加できる
 * 人の目は輝度(色の明るさ)に敏感、色味には鈍感

JPEG や多くの動画形式では Y はそのままで Cb, Cr のサンプルを間引く、クロマサブサンプリング方式でデータ量を節約します。尚、多くの動画形式は YCbCr でなく YUV で少し計算が異なります、概念的には似たものです。

### クロマサブサンプリング

### YUVabc

間引きかたによって YUV444、YUV422 のように表現します。

* YUV444
<center> <img src="../yuv444.png" /> </center>

* YUV422
<center> <img src="../yuv422.png" /> </center>

より詳しくは以下のエントリをご参考ください。

 * JPEG のクロマサブサンプリングと YUVabc について
   * http://blog.awm.jp/2016/02/10/yuv/

## デメリット

RGB と YCbCr は色空間が斜めの関係にあり、YCbCr は RGB を全部カバーする為、同じ 0-255 でも RGB より YCbCr の方が大きなスケールを表現します。

 * 大きな立体が YCbCr の空間で、中の小さい立体が RGB の収まる範囲です。

<center> <img src="../rgb2ycbcr_half.png" /> </center> (<a href="../RGB2YCbCr.gcx"> Grapher ファイル</a> | <a href="../makeVert.phps"> プロット生成スクリプト  </a>)

(奥行きが分かりにくいのですが頂点の丸が大きい方が手前です。後で改善します)

 大小２つの立方体の間にある隙間が RGB<=>YCbCr で死ぬ無駄な空間で、YCbCr のビット数を RGB と同じにすると粒度が荒くなり表現できる色数が減ります。色数が1/4ほどまで減るとも言われます。

詳しくは以下のページを参照下さい。

 * ConvertToRGB
  * http://csbarn.blogspot.jp/2012/01/converttorgb.html

# まとめ

 * メリットとして色成分だけ間引く事で見た目をあまり変えずにデータを少なく出来る。
 * デメリットとして 8bit depth のはずが実際には約 7bit depth 分しかない。(ちなみに人間の目は 10bit まで識別可能)

# 参考ページ

 * JPEG File Interchange Format
   * https://www.w3.org/Graphics/JPEG/jfif3.pdf
 * RGB⇔YCbCr変換
   * http://koujinz.cocolog-nifty.com/blog/2009/03/rgbycbcr-a4a5.html
 * XYZ表色系
   * http://www.dic-color.com/knowledge/xyz.html
 * ImageMagickでHSLとHSV色空間を理解する
   * http://smash.nobuto-murata.org/2009/12/imagemagickhslhsv.html

