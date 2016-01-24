+++
categories = ["ImageMagick"]
date = "2016-01-25T01:51:23+09:00"
draft = false
tags = ["ImageMagick", "Graphics"]
title = "ImageMagick で画像を比較する"

+++

#
絵の間違い探しを想像するに、人間は思った以上に注意力がありません。
最終的な判断は人間の眼ですが、その前段階のサポートがないと問題を見逃します。

基本的には計算でなるべく違いのありそうな画像をあぶり出します。
以下のサイトが分かりやすいです。

 * 2枚の画像のdiff(差分)を超簡単に調べる方法
  *  http://blog.mirakui.com/entry/20110326/1301111196

## 画像の差分

 * difference

-compose difference と -auto-level を使うと、違いがあるかもしれない箇所を調べられます。

<pre>
$ convert image.jpg image.gif
$ composite <u>-compose difference</u> image.jpg image.gif  diff.png
$ mogrify -auto-level  diff.png  #差分画像を明るくする
</pre>

<center> <img src="../image7p20.jpg" /> <img src="../image8p20.gif" /> <img src="../image9p20.png" /> </center>

全体的に画質の劣化が激しいですが、特に風鈴の色味が大きく変わっているのが分かります。

 * identify mean

difference と idenfity mean を組み合わせると画像の違いの度合いが分かります。

<pre>
$ for i in *-logo.gif ; do 
composite -compose difference 6.9.3-0-logo.gif $i t.png ;
identify -format "%[mean]" t.png  ; echo " : $i" ; done
</pre>
のように実行すると、
<pre>
569.07 : 6.6.9-6-logo.gif
569.07 : 6.6.9-7-logo.gif
<b>9533.31</b> : 6.6.9-8-logo.gif   <=  差分の大きなバージョン発見
569.07 : 6.6.9-9-logo.gif
569.07 : 6.7.0-0-logo.gif
</pre>


尚、画像の違いを計算する方法に幾つか有名なものがあり、今回の方式は PSNR に近いのですが、人の目で見る違いと掛け離れるケースが多くあるので、SSIM 方式の方が主流です。

# SSIM

SSIM の簡易版が ffmpeg で計算できます。

<pre>

</pre>