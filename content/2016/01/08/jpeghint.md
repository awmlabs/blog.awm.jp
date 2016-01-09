+++
categories = ["ImageMagick"]
date = "2016-01-08T23:40:32+09:00"
draft = false
tags = ["ImageMagick", "JPEG", "Resize"]
title = "JPEG の size hinting について"
+++

しつこいですけど、以下の記事の -define jpeg:size への勝手な補足。

 * もうサムネイルで泣かないための ImageMagick ノウハウ集
   * http://blog.cybozu.io/entry/2016/01/06/080000
```
いつでもつければ良いというものではないので注意しましょう。弊社では、
このオプションはサービスの安定運用のためには無用と判断し、
現在このオプションは利用していません。
```

注意する点ではありますが、この結論では誤解する人が出そうなので勝手に補足します。

# -define jpeg:size とは？

## JPEG のデータの持ち方

JPEG は画像の周波数成分のデータを保持していて、JPEG のdecode では波を合成する事でビットマップ画像に戻します。尚、8x8 単位で画像をグリッド分割してこの処理をします。

(参考イメージ)
<center> <img src="/2016/01/08/dct8x8-600.png" /> </center>
引用) https://www.cl.cam.ac.uk/teaching/1011/R08/jpeg/acs10-jpeg.pdf

## scale factor つきでデコード

元のサイズの画像データに変換する場合と比べて、手間を増やさず 1/2, 1/4, 1/8 サイズの画像データに変換できます。高周波成分を見なくて済む上に変換後のサイズが小さい事から、むしろより少ない手間でさえあります。

<center> <img src="/2016/01/08/dct8x8-4-1-600.png" /> </center>

大きなサイズの画像からサムネール画像を生成するのに、一般的なリサイズのアルゴリズムを使わずにいきなり 1/2, 1/4, 1/8 の画像に変換、デコード出来ます。

ImageMagick (から利用する libjpeg) が 2,4,8 のように 2^n に限っているのは、波の合成(iDCT)の高速化で FFT を使う都合でしょう。

## JPEG size hinting の例

### 小さくリサイズする場合
 * 普通にリサイズ (-define jpeg:size 無し)
<center> <img src="/2016/01/08/resize1.png" /> </center>

 * 小さいサイズでデコードしてリサイズ (-define jpeg:size 有り)
<center> <img src="/2016/01/08/resize2.png" /> </center>

処理は減るしメモリも少ないし、パフォーマンス的には良い事づくめ。

### 大きくリサイズする場合

問題にしているケースです。

 * 普通にリサイズ (-define jpeg:size 無し)
<center> <img src="/2016/01/08/resize3.png" /> </center>

 * 大きくリサイズする場合 (-define jpeg:size 有り)
<center> <img src="/2016/01/08/resize4.png" /> </center>

動作を考えれば当たり前でメモリを沢山使います。

# ご提案

リサイズで大きくなる時にメモリを沢山使うのは別に不思議な現象ではない。
メモリを沢山使うのは確かなので、サイズが小さくなる時だけ -define jpeg:size を使うよう注意すれば良いでしょう。
但し、通常のリサイズアルゴリズムと違う処理になるので、画質については注意が必要です。
