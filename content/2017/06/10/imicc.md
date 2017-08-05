+++
date = "2017-06-10"
title = "ImageMagick で ICC プロファイルを扱う #1 前置き"
draft = false
categories = ["ImageMagick"]
tags = ["ICC", "JPEG"]
+++

# はじめに

前置きは要らなくて ImageMagick コマンドの実行例を知りたいという人は、次のエントリをどうぞ。

- ImageMagick で ICC プロファイルを扱う #2 コマンド実例行
   - http://blog.awm.jp/2017/06/11/imicc/

# 色域と ICC プロファイルと JPEG

コンピュータ画像が色を表現するのに用いるRGB(red,gree,blue)の数値。例えば、RGB=(<font color="#F44">255</font>,<font color="#0C0"> 0</font>,<font color="#68F">0</font>)は赤色を表しますが、実際にどこまで鮮やかな赤を出せるのかはモニタや印刷機によります。
そこで表示デバイスの発色性能に合わせて、RGB の値が具体的にどの色に対応するかを規定する色空間が多く存在します。色域は各々の色空間で表現できる色の範囲です。

##  色域

よく知られている規格と色域(色度図中の三角形)を並べます。

 |
------------ | ------------
sRGB | 古くからの規格で多くのモニタはこれに従います。Web の実質的な標準です。
P3 | 映画業界で使われているそうで、鮮やかな赤が表現できます。
Adobe RGB | 印刷業界でよく使われます。鮮やかな緑が表現できます。
ProPhoto RGB | 少し高価なデジカメで保存する時に選択できます。上記3つより更に鮮やかな色を表現できます

<center>
	Gamut(色域) <br />
<img src="../fapo_3M01_may2013-LoRes.png" /> <br />
(引用元: <a href="https://www.reddit.com/r/apple/comments/5287c3/lets_talk_about_that_new_display_in_iphone_7/#d7i93i7"> lets_talk_about_that_new_display_in_iphone_7/#d7i93i7</a>)
</center>

このグラフは色度図(CIE Chromaticity Diagram) と呼びます。馬蹄型の輪郭線は人間が視覚に捉える事のできる色の鮮やかさの限界を示し、その中の三角形は RGB 値が表現できる色の範囲です。赤(255,0,0)、緑(255,0,0)、青(0,0,255)が３つの頂点に対応します。

## ICC プロファイル

ICC プロファイルは、画像の RGB値(もしくはCMYK値)が具体的にどの色なのかを示す対応データです。

<center>
<img src="../../../..//2016/01/26/craigrevie_14_25per.png" /> <br />
(引用元: <a href="http://www.color.org/craigrevie.pdf"> </a> © FujiFilm 2002)
</center>

## JPEGと ICC プロファイル

JPEG の画像データに ICC プロファイルを付加する事で、画像ビューアにカラーマネジメントシステムがあればそれを補正データとして用い、発色の良いモニタは性能を生かして目一杯、元の色を忠実に再現し、古いモニタでは表示できない色は妥協しつつ出来る限り本来の色に近くなるよう色の補正を行います。

JPEG と ICC プロファイルについて、より詳しくは以下のエントリをどうぞ。

- JPEG と ICC プロファイル
  - https://blog.awm.jp/2016/09/10/jpegicc/

<center>
<img src="../../../..//2016/09/10/jpeg-profile-icc.png" /> <br />
<img src="../../../..//2016/09/10/figure-srgb-adobergb.png" />
</center>

# 最後に

sRGB は大昔の規格である為、今どきの感覚では色域がかなり狭い範囲に制限されます。つまり、鮮やかな色の表示を諦める事があります。 今までは一般に普及している殆どのモニタで sRGB をカバーするのが精一杯でしたので、sRGB のみを考えるのも手でしたが、最近では P3 や AdobeRGB といったより広い色域に対応したモニタが普及価格帯に落ちて来ているので、正面から向き合う必要があるでしょう。
 
さて、前置きは以上で、本題のエントリをどうぞ。

- ImageMagick で ICC プロファイルを扱う #2 コマンド実行例
  - http://blog.awm.jp/2017/06/11/imicc/

# 蛇足？

色々書きましたが、こっちの解説見た方が良いかも。具体的ですし。

- Webブラウザのカラーマネジメント対応まとめ（2月4日更新）
  - http://blog.livedoor.jp/yamma_ma/archives/3368577.html
