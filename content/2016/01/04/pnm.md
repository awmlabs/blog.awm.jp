+++
title = "PNM と ImageMagick で画像ファイルを手作り生成"
date = "2016-01-04T19:38:39+09:00"
categories = ["Graphics"]
tags = ["PNM", "ImageMagick", "PBM", "PGM", "PPM"]
draft = false
+++

# PNM と ImageMagick で画像ファイルを手作り生成

何らかの画像実験で都合の良い画像ファイルが欲しい時にテキストエディタで作れると便利で、PNM (Portable aNyMap) フォーマットを利用するとそんな事が簡単に出来ます。

# PNM とは

古くからある画像フォーマット群で ASCII テキストでもバイナリでも表現出来る事が大きな特徴です、尚、圧縮はいたしません。

 * Wikiedia: [PNM (画像フォーマット)](https://ja.wikipedia.org/wiki/PNM_(%E7%94%BB%E5%83%8F%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88))

PNM は 以下の３つのフォーマットをまとめた呼び方です。

 * PBM (portable bitmap)
   * http://netpbm.sourceforge.net/doc/pbm.html
 * PGM (portable graymap)
   * http://netpbm.sourceforge.net/doc/pgm.html
 * PPM (portable pixmap)
   * http://netpbm.sourceforge.net/doc/ppm.html

## 拡張フォーマット

PNM ファミリーではない為に今回は解説しませんが、以下の拡張フォーマットがあります。PAM は透明度が表現できます。PFM は float 表現です。

 * PAM (portable arbitrary map)
   * http://netpbm.sourceforge.net/doc/pam.html
 * PFM (portable float map)
   * http://netpbm.sourceforge.net/doc/pfm.html

# フォーマット概要

ファイル先頭の文字列に応じて、以下のフォーマットに分かれます。(尚、PAM形式は P7 で、PFM形式は PF, Pf です)

ファイル先頭 | フォーマット | データ表現 | 画像表現
------------ | ------------ | ---------- | --------
P1 |  PBM | ASCII | 白黒画像
P2 |  PGM | ASCII | グレー画像
P3 |  PPM | ASCII | カラー画像(RGB)
P4 |  PGM | Binary | 白黒画像
P5 |  PGM | Binary | グレー画像
P6 |  PPM | Binary | カラー画像(RGB)

データ表現が ASCII の場合は以下のフォーマットをとります。
```
フォーマット種別 # P1〜P6のいずれか。
横サイズ 縦サイズ
最大値             # P1 の時は実質1固定なので省略
画像データの並び
.....
```

# PBM (portable bitmap format)

画像の白黒を 0,1 で表現します。(0:白、1:黒である事に注意)

 *  batsu.pbm

```
P1
7 7
P1
7 7
1 0 0 0 0 0 1
0 1 0 0 0 1 0
0 0 1 0 1 0 0
0 0 0 1 0 0 0
0 0 1 0 1 0 0
0 1 0 0 0 1 0
1 0 0 0 0 0 1
```

ImageMagick の convert で変換します。ついでに8倍に拡大したものも。
```
$ convert batsu.pbm batsu.png
$ convert -resize 800% -filter point batsu.png batsu_8.png
```

<center> <img src="/2016/01/04/batsu.png" title="batsu" > </center>
<center> 8倍に ↓ 拡大 </center>
<center> <img src="/2016/01/04/batsu_8.png" title="batsu_8" > </center>

# PGM (portable graymap format)

白と黒の間で濃淡をつけられます。いわゆるグレー画像です。4段階で作ってみます。

 * batsu_gray.pgm

```
P2
7 7
4
4 0 0 0 0 0 4
0 3 0 0 0 3 0
0 0 2 0 2 0 0
0 0 0 1 0 0 0
0 0 2 0 2 0 0
0 3 0 0 0 3 0
4 0 0 0 0 0 4
```

convert で変換 & 8倍画像
```
$ convert batsu_gray.pgm batsu_gray.png
$ convert -resize 800% -filter point batsu_gray.png batsu_gray_8.png
```

<center> <img src="/2016/01/04/batsu_gray.png" title="batsu_gray" > </center>
<center> 8倍に ↓ 拡大 </center>
<center> <img src="/2016/01/04/batsu_gray_8.png" title="batsu_gray_8" > </center>

# PPM (portable pixmap format)

RGB でカラーを表現できます。以下のも4段階です。ちなみに、256 段階を指定すると皆さんお馴染みの RGB 表現になります。

 * batsu_rgb.ppm

```
P3
7 7
4
4 0 0  0 0 0  0 0 0  0 0 0  0 0 0  0 0 0  0 0 4
0 0 0  3 0 0  0 0 0  0 0 0  0 0 0  0 0 3  0 0 0
0 0 0  0 0 0  2 0 0  0 0 0  0 0 3  0 0 0  0 0 0
0 0 0  0 0 0  0 0 0  1 1 1  0 0 0  0 0 0  0 0 0
0 0 0  0 0 0  0 2 0  0 0 0  2 2 0  0 0 0  0 0 0
0 0 0  0 3 0  0 0 0  0 0 0  0 0 0  3 3 0  0 0 0
0 4 0  0 0 0  0 0 0  0 0 0  0 0 0  0 0 0  4 4 0
```

convert で変換
```
$ convert batsu_rgb.ppm batsu_rgb.png
$ convert -resize 800% -filter point batsu_rgb.png batsu_rgb_8.png
```
<center> <img src="/2016/01/04/batsu_rgb.png" title="batsu_rgb" > </center>
<center> 8倍に ↓ 拡大 </center>
<center> <img src="/2016/01/04/batsu_rgb_8.png" title="batsu_rgb_8" > </center>

# さいごに

エディタで任意のビットマップ画像を作りたい時にご活用下さい。たまに便利です。

# 参考 URL

 * Wikipedia: [PNM (画像フォーマット)](https://ja.wikipedia.org/wiki/PNM_(%E7%94%BB%E5%83%8F%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88))
 * 碧色工房 〜 PNM ( PPM / PGM / PBM ) ファイルフォーマット
   * http://www.mm2d.net/main/prog/c/image_io-01.html
 * https://github.com/ImageMagick/ImageMagick/blob/master/coders/pnm.c

