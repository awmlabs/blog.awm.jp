+++
categories = ["ImageMagick"]
date = "2016-01-08T23:40:32+09:00"
draft = false
tags = ["ImageMagick", "JPEG", "Resize"]
title = "JPEG の size hinting について"
+++

何度もしつこいですが、以下の記事の -define jpeg:size への勝手な補足。

 * もうサムネイルで泣かないための ImageMagick ノウハウ集
   * http://blog.cybozu.io/entry/2016/01/06/080000

```
いつでもつければ良いというものではないので注意しましょう。
弊社では、このオプションはサービスの安定運用のためには無用と判断し、
現在このオプションは利用していません。
```

注意する点ではありますが、この結論では「JPEG size hinting は危険なので使わない方が良い」と誤解する人が出そうなので勝手に補足します。

# 前提知識

## JPEG のデータの持ち方

JPEG は画像の周波数成分のデータを保持していて、JPEG の Decode では波を合成する事でビットマップ画像に戻します。尚、8x8 単位で画像をグリッド分割してこの処理をします。

(参考イメージ)
<center> <img src="/2016/01/08/dct8x8-600.png" /> </center>
引用) https://www.cl.cam.ac.uk/teaching/1011/R08/jpeg/acs10-jpeg.pdf

## scaling 指定で Decode

元のサイズの画像データに変換する場合と比べて、手間を増やさず 1/2, 1/4, 1/8 サイズの画像データに変換できます。高周波成分を見なくて済む上に変換後のサイズが小さい事から、むしろより少ない手間でさえあります。

<center> <img src="/2016/01/08/dct8x8-4-1-600.png" /> </center>

(ImageMagick から利用する libjpeg で 2,4,8 のように 2^n に限っているのは、波の合成(iDCT)の高速化で FFT を使う都合か。もしくは波のループの端が合わないか。)

##  やりたい事

リサイズ後の大きさに近くなるよう scale factor を指定して JPEG を Decode し。そこからリサイズする事で、メモリやCPUを節約します。

# JPEG size hinting の動作イメージ

詳しくはこちらを参照して下さい。

 * 本当は速いImageMagick: サムネイル画像生成を10倍速くする方法
  * http://blog.mirakui.com/entry/20110123/1295795409

## 小さくリサイズする場合

 * 普通にリサイズ (-define jpeg:size 無し)
<center> <img src="/2016/01/08/resize1.png" /> </center>

 * 小さいサイズでデコードしてリサイズ (-define jpeg:size 有り)
<center> <img src="/2016/01/08/resize2.png" /> </center>

処理は減るしメモリも少ないし、パフォーマンス的には良い事づくめ。

## 大きくリサイズする場合 (予想)

問題にしているケースです。

 * 普通にリサイズ (-define jpeg:size 無し)
<center> <img src="/2016/01/08/resize3.png" /> </center>

 * 大きなサイズでデコードしてリサイズ (-define jpeg:size 有り)
<center> <img src="/2016/01/08/resize4.png" /> </center>

という動作が予想できます。1.5倍のメモリを使うという話も 2, 4, 8 倍で丁度良いサイズになる事はあまりないので、そこそこ話が合います。

### 実際の動き

jpeg_info の output_width, output_height を表示させて確認したところ、拡大する時には最大でも2倍指定で Decode するようです。どんなに元画像とのサイズの差をつけても 4, 8 倍にはなりませんでした。

<center> <img src="/2016/01/08/resize5.png" /> </center>

* fprintf で表示させる

{{< highlight c >}}

      fprintf(stderr, "AAA: jpeg_info:image_width,height:%d,%d output_width,height:%d,%d scale_num:%d scale_denom:%d\n", jpeg_info.image_width, jpeg_info.image_height, jpeg_info.output_width, jpeg_info.output_height, jpeg_info.scale_num, jpeg_info.scale_denom);

      jpeg_calc_output_dimensions(&jpeg_info);

      fprintf(stderr, "ZZZ: jpeg_info:image_width,height:%d,%d output_width,height:%d,%d scale_num:%d scale_denom:%d\n", jpeg_info.image_width, jpeg_info.image_height, jpeg_info.output_width, jpeg_info.output_height, jpeg_info.scale_num, jpeg_info.scale_denom);

{{< /highlight >}}

* 縮小では 1/8 まで scaling decode が効く

```
$ convert -define jpeg:size=8x8 -resize 8x8 8000x8000.jpg 8x8.jpg
AAA: jpeg_info:image_width,height:8000,8000 output_width,height:8000,8000 scale_num:1 scale_denom:1000
ZZZ: jpeg_info:image_width,height:8000,8000 output_width,height:1000,1000 scale_num:1 scale_denom:1000
```

* 拡大では 2倍までしか効かない

```
$ convert -define jpeg:size=8000x8000 -resize 8000x8000 8x8.jpg 8000x8000.jpg
AAA: jpeg_info:image_width,height:8,8 output_width,height:8,8 scale_num:1 scale_denom:0
ZZZ: jpeg_info:image_width,height:8,8 output_width,height:16,16 scale_num:1 scale_denom:0
```

# 結論

拡大時もそんなに極端にメモリは食わないはずですが、例のブログでは 1.5 倍使うという報告もありますし、2倍か3倍以上小さくリサイズする時だけ -define jpeg:size をつけるよう気をつければ良いと思います。ただしリサイズアルゴリズムとは処理が異なるので、画質的に大丈夫か確認した方が良いでしょう。

# scaling の該当コード

* http://gt.awm.jp/ImageMagick-6.9.3-0/S/1372.html#L1105
  * ReadJPEGImage (coders/jpeg.c)
{{< highlight c >}}
      jpeg_info.scale_num=1U;
      jpeg_info.scale_denom=(unsigned int) scale_factor;
      jpeg_calc_output_dimensions(&jpeg_info);
{{< /highlight >}}

(scale_num/scale_denom) 倍で変換するので、縮小しか対応していないように見えますが。libjpeg の中でよしなに処理してくれるようです。

 * http://gt.awm.jp/jpeg-8/S/85.html#L52
   * jpeg_core_output_dimensions
{{< highlight c >}}
  /* Compute actual output image dimensions and DCT scaling choices. */
  if (cinfo->scale_num * cinfo->block_size <= cinfo->scale_denom) {
    /* Provide 1/block_size scaling */
    cinfo->output_width = (JDIMENSION)
      jdiv_round_up((long) cinfo->image_width, (long) cinfo->block_size);
    cinfo->output_height = (JDIMENSION)
      jdiv_round_up((long) cinfo->image_height, (long) cinfo->block_size);
    cinfo->min_DCT_h_scaled_size = 1;
    cinfo->min_DCT_v_scaled_size = 1;
  } else if (cinfo->scale_num * cinfo->block_size <= cinfo->scale_denom * 2) {
    /* Provide 2/block_size scaling */
    cinfo->output_width = (JDIMENSION)
      jdiv_round_up((long) cinfo->image_width * 2L, (long) cinfo->block_size);
    cinfo->output_height = (JDIMENSION)
      jdiv_round_up((long) cinfo->image_height * 2L, (long) cinfo->block_size);
    cinfo->min_DCT_h_scaled_size = 2;
    cinfo->min_DCT_v_scaled_size = 2;
  } else if (cinfo->scale_num * cinfo->block_size <= cinfo->scale_denom * 3) {
＜略＞
{{< /highlight >}}

この 2/block_size scaling の条件にマッチしたのかなと予想してます。

# 参考 URL

 * https://en.wikipedia.org/wiki/Libjpeg
 * JPEG tutorial
   * https://www.cl.cam.ac.uk/teaching/1011/R08/jpeg/acs10-jpeg.pdf
 * 本当は速いImageMagick: サムネイル画像生成を10倍速くする方法
   * http://blog.mirakui.com/entry/20110123/1295795409
 * JPEGヒント(scale denom)とは
   * http://kkoudev.github.io/blog/2014/06/15/imlib2/
 * JPEG ライブラリを試す
   * http://mibai.tec.u-ryukyu.ac.jp/~oshiro/Doc/misc/Jpeg-lib/
 * New djpeg -scale N/8 with all N=1...16 feature
   * http://jpegclub.org/djpeg/
