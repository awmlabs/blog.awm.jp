+++
categories = ["ImageMagick"]
date = "2016-01-06T16:27:11+09:00"
draft = false
tags = ["ImageMagick", "PNG", "ColorSpace"]
title = "グレー形式JPEGをPNGに変換すると暗くなる件"

+++

# グレー形式JPEGをPNGに変換すると暗くなる件

画像サムネール界隈で話題のエントリ

 * もうサムネイルで泣かないための ImageMagick ノウハウ集
   * http://blog.cybozu.io/entry/2016/01/06/080000

-limit memory でのリソース制限や jpeghint が拡大の時はまずいという問題の指摘等、素晴らしいエントリですが、少し気になる事が。

```
グレイスケール画像を考慮しよう

白黒画像を PNG に変換すると、元画像より暗くなる場合があります。
これは減色アルゴリズムによる挙動と思われます。
JPEG はフルカラー画像を扱えますが、通常の PNG だと 256 色しか扱えないのです。
```

減色処理でここまで暗くなるのは違和感ありますし、出力で PNG8 がデフォというのも妙なので調べた所、少し前にあった ImageMagick のバグだったので話を整理しておきます。

# いつ頃のバグ

6.8.0-0 〜 6.8.0-7 の間のバグです。
6.8.0 で RGB互換の色空間処理を整理していた時のデグレードだと思われます。

6.8.0-8 で修正済みです。

# 不具合修正のコード差分

```
$ diff -rwb  ImageMagick-6.8.0-[78]/coders/png.c
8305,8306c8305,8306
<          if ((IssRGBCompatibleColorspace(image->colorspace) == MagickFalse) &&
<              (IssRGBColorspace(image->colorspace) == MagickFalse))
---
>          if ((IssRGBCompatibleColorspace(image->colorspace) == MagickFalse) ||
>              (IssRGBColorspace(image->colorspace) != MagickFalse))
```

あ、はい。って感じです。

# PNG8

もう一点、グレー形式JPEG を PNG に変換するとパレット形式(PNG)になるとの事ですが実はバージョンに依ります。気まぐれで本当にすみません。

直近だとこんな対応。

バージョン|形式
------|------
6.9.1-10 | GRAY
6.9.1-2 | GRAY
6.9.1-3 | GRB (PNG24)
6.9.1-4 | GRB (PNG24)
6.9.1-5 | GRAY
6.9.1-6 | GRAY
6.9.1-7 | GRAY
6.9.1-8 | GRAY
6.9.1-9 | GRAY

では、不具合のあった 6.8.x の頃はどうだったかというと。

バージョン|形式
------|------
6.8.0-0 | GRAY
6.8.0-1 | GRAY
6.8.0-2 | GRAY
6.8.0-3 | GRAY
6.8.0-4 | GRAY
6.8.0-5 | GRAY
6.8.0-6 | GRAY
6.8.0-7 | GRAY
6.8.0-8 | PALETTE (PNG8)
6.8.0-9 | PALETTE (PNG8)
6.8.0-10 | PALETTE (PNG8)

あれ。。不具合のあった 6.8.0-0 〜 6.8.0-7 は GRAY 形式。

多分ですけど。グレー画像が暗くなる時に使った ImageMagick と、パレット形式だと確認した時のバージョンが違うのではないかなーと思ってます。
