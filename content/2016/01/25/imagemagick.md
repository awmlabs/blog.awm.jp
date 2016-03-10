+++
categories = ["ImageMagick"]
date = "2016-01-25T00:32:35+09:00"
draft = false
tags = ["ImageMagick", "JPEG", "Orientation"]
title = "もうサムネイルで泣かないための ImageMagick ノウハウ集に一言"

+++

# もうサムネイルで泣かないための ImageMagick ノウハウ集に一言

<center>
<iframe allowfullscreen="true" allowtransparency="true" frameborder="0" height="497" mozallowfullscreen="true" src="//speakerdeck.com/player/248da47aa52d48ae8d57e8656f117997" style="border:0; padding:0; margin:0; background:transparent;" webkitallowfullscreen="true" width="578"></iframe>
https://speakerdeck.com/yoya/imagemagick-knowhow
</center>


発表スライドだと URL のリンクが辿りにくいのとブログ形式で読みたいとの声があり、ほぼ同じ内容のエントリを作りました。

# 一部界隈で話題

 * もうサムネイルで泣かないための ImageMagick ノウハウ集
   * http://blog.cybozu.io/entry/2016/01/06/080000
<center> <img src="../cybozuinsideout.png" /> </center>

色んなノウハウが詰まっていて素晴らしい記事です。便乗して幾つか勝手に補足してみます。

# 良いノウハウ

## リリース大量消費に注意

 * limit 大事 (特にユーザ投稿画像を扱う場合)
<pre>
$ convert -limit <u>memory 256MB</u> -limit <u>disk 0</u> src.jpg dst.png
</pre>

画像や処理によって予期しない量のメモリを使われる事があるので、-limit memory で制限をかけるのと、仮にディスクが使われた日には極端に遅くなるので -limit disk も必要です。

## CMYK 画像を考慮しよう

画像データの色の表現は主に RGB と CMYK が使われます。この内 CMYK の画像をそのままリサイズすると色味が壊れます。これはリサイズの補間アルゴリズムがリニアRGBを前提としているからだと思われます。

ちなみに、この"リニア"RGB というのが曲者で、画像は sRGB で入っている事が多くガンマ補正がかかっているので、実は微妙に明るさが期待したものより暗くなる事があります。
補間の問題なのでドットが疎らに入っている画像で特に暗くなる傾向があります。
<!-- 色数少なめでディザをかけた画像で実験すると顕著に差が出ます。 -->

厳密に処理したい場合は RGB にしてから処理すると良いでしょう。

 * Resizing with Colorspace Correction
  * http://www.imagemagick.org/Usage/resize/#resize_colorspace

```
$ convert earth_lights_4800.tif \
          -colorspace RGB -resize 500 --colorspace sRGB \
          earth_lights_colorspace.png
```

## ImageMagick のオプションの順序に注意

 * ImageMagick は引数を先頭から順に命令実行する

以下のように、for ループで引数を先頭から順番に見て、オプションに対応する関数を個別に実行します。

 * wand/mogrify.c (convert も引数チェック後にこの関数を呼ぶ)

{{< highlight c >}}
WandExport MagickBooleanType MogrifyImage(ImageInfo *image_info,const int argc,
  const char **argv,Image **image,ExceptionInfo *exception)
＜略＞
  for (i=0; i < (ssize_t) argc; i++)
  {
    option=argv[i];
    ＜略＞
    switch (*(option+1))
    {
       ＜略＞
      case 'r':
      {
         ＜略＞
        if (LocaleCompare("repage",option+1) == 0)
          {
            if (*option == '+')
              {
                (void) ParseAbsoluteGeometry("0x0+0+0",&(*image)->page);
                break;
              }
            (void) ResetImagePage(*image,argv[i+1]);
            InheritException(exception,&(*image)->exception);
            break;
          }
{{< /highlight >}}

逆にいうと順序次第で組み合わせ的に色んな操作が可能になるという事です。

# 補足したい項目

対応するブログのエントリを並べます。

## 画像比較は人間の眼で行うべし

 * ImageMagick で画像を比較する
   * http://blog.awm.jp/2016/01/25/diff/

ある程度、計算で差分の多い画像や領域を自動抽出できます。

## Orientation を考慮しよう

 * -auto-orient でオフセットがズレる件
   * http://blog.awm.jp/2016/01/06/orient/

JPEG を経由しなくても +repage で対処出来る。かもしれません。

## 透過画像を考慮しよう

 * 透明度を含む画像を JPEG に変換する時の背景色
   * http://blog.awm.jp/2016/01/25/flatten/

結果は恐らく変わらないので重箱の隅付きですが、-extent は副作用的に対処出来るだけで、-flatten がズバリの処理です。

## グレイスケール画像を考慮しよう

 * グレー形式JPEGをPNGに変換すると暗くなる件
   * http://blog.awm.jp/2016/01/06/gray/

6.8.0-0 〜 6.8.0-7 にあった色空間変換のバグです。回避策として PNG24, PNG32 に変換するのも良いですが、減色が理由ではないので PNG8 でも良いかもしれません。
<!-- (もしかして Colorspace を明示的に指定するとうまくいくかも？) -->

## -define jpeg:size に注意

 * JPEG の size hinting について
   * http://blog.awm.jp/2016/01/08/jpeghint/

大きい方向にリサイズする時はメモリを余計に消費しますが、小さい方にリサイズする場合は大変有効ですので、是非使いましょう。元の 1/2 以下にリサイズする場合は jpeg:size をつける。という条件をつけるのが良さそうです。


# さいごに

以上です。誤りや物足りない所があればご指摘ください。

もし、お役に立つ事があれば幸いです。
