+++
date = "2017-06-10"
title = "ImageMagick で ICC プロファイルを扱う #1 前置き"
draft = false
categories = ["ImageMagick"]
tags = ["ICC", "JPEG"]
+++

# はじめに

前置きは要らなくてコマンドの実行例を知りたいという人は、次のエントリをどうぞ。

- ImageMagick で ICC プロファイルを扱う #2 コマンド実例行
   - http://blog.awm.jp/2017/06/11/imicc/

# JPEG と ICC

ICC プロファイルは、モニタやプリンタ、デジカメ等、色を扱う機器毎に発色が異なる状況に対して、なるべく見た目の違いがなくなるよう調整する補正データです。

<center>
<img src="../../../..//2016/01/26/craigrevie_14_25per.png" /> <br />
(引用元: <a href="http://www.color.org/craigrevie.pdf"> </a> © FujiFilm 2002)
</center>


JPEG の画像データに、RGB の色空間を示す ICC プロファイルをメタデータとして付ける事で、発色の良いモニタは性能を生かして目一杯鮮やかに表示し、古いモニタでは表示できない色は妥協しつつ、出来る限り本来の色に近くなるよう色の補正を行います。

詳しくは以下のエントリでどうぞ。

- JPEG と ICC プロファイル
  - https://blog.awm.jp/2016/09/10/jpegicc/

<center>
<img src="../../../..//2016/09/10/jpeg-profile-icc.png" />
</center>
 
# 色域 (Gamut)

モニタが表示する実際の色と RGB値を対応づける規格が幾つか存在します。よく知られている規格を並べます。

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

このグラフは色度図(CIE Chromaticity Diagram) と呼ばれるもので、馬蹄型の範囲は人間が視覚に捉える事のできる色の鮮やかさの限界を示し、その中の三角形は RGB 値が表現できる色の範囲を示します。赤(255,0,0)、緑(255,0,0)、青(0,0,255)が３つの頂点に対応します。

sRGB は大昔の規格である為、今どきの感覚では色域がかなり狭い範囲に制限されます。つまり、鮮やかな色の表示を諦める事があります。 今までだと、一般に普及している殆どのモニタは sRGB をカバーするのが精一杯でしたので、sRGB のみを考えるのも手でしたが、最近では P3、AdobeRGB といったより広い色域に対応したモニタが普及価格帯に落ちて来ているので、正面から向き合う必要があるでしょう。

さて、前置きは以上で、本題のエントリをどうぞ。

- ImageMagick で ICC プロファイルを扱う #2 コマンド実行例
  - http://blog.awm.jp/2017/06/11/imicc/

# 蛇足？

色々書きましたが、こっちの解説見た方が良いかも。

- Webブラウザのカラーマネジメント対応まとめ（2月4日更新）
  - http://blog.livedoor.jp/yamma_ma/archives/3368577.html
