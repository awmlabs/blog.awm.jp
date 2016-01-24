+++
categories = ["ImageMagick"]
date = "2016-01-25T01:51:23+09:00"
draft = false
tags = ["ImageMagick", "Graphics"]
title = "ImageMagick で画像を比較する"

+++

# ImageMagick で画像を比較する

 * もうサムネイルで泣かないための ImageMagick ノウハウ集
   * http://blog.cybozu.io/entry/2016/01/06/080000

```
サムネイル周りに何か修正を入れたら修正前後の画像を比較しましょう。
機械によるバイト列の比較では画像の良し悪しがわかりません。
頼れるのは人間の眼だけです。肉眼で確認しましょう。
```

絵の間違い探しでの見落としを想像するに、画像認識の個人差はとても大きいです。
最終的な判断は人間の眼とはいえ、その前段階のサポートがあると良いでしょう。

計算でなるべく違いのありそうな画像やその違いのある場所を炙り出します。
以下のサイトの説明が分かりやすいです。

 * 2枚の画像のdiff(差分)を超簡単に調べる方法
  *  http://blog.mirakui.com/entry/20110326/1301111196

## 画像の差分

 * difference

-compose difference と -auto-level を使うと、違いがあるかもしれない箇所を浮き彫りにできます。

<pre>
$ convert image.jpg image.gif
$ composite <u>-compose difference</u> image.jpg image.gif  diff.png
$ mogrify -auto-level  diff.png  #差分画像を明るくする
</pre>

<center> <img src="../image7p20.jpg" /> <img src="../image8p20.gif" /> <img src="../image9p20.png" /> </center>

全体的に画質の劣化が激しいですが、特に風鈴のハイライトの色味が変わっているのが分かります。

 * identify mean

difference と idenfity mean を組み合わせると画像の違いの度合いを算出できます。

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

以上の方法は PSNR 方式に近いのですが、人の目で見る違いと掛け離れるケースが多くあり、SSIM 方式の方が主流です。

# SSIM

画質の劣化の指標でよく使われる値で、その簡易版が ffmpeg で計算できます。類似度なので 1.0 が最大値で、違いがある分減って 0 に近づきます。

2.6 系にはない機能です。2.8 系の ffmpeg でお試し下さい。

<pre>
$ ffmpeg -i image7.jpg -i image8.gif -filter_complex ssim -an -f null -
＜略＞
[Parsed_ssim_0 @ 0x7fe623c00340] SSIM Y:0.886660 U:0.849172 V:0.840235 All:0.858689 (8.498241)
</pre>

１つ目に渡した入力画像が JPEG なので YUV 別の SSIM 値と合わせた SSIM 値が表示されています。これが GIF や PNG だと RGB別になります。
