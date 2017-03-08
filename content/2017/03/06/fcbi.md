+++
draft = true
tags = ["FCBI", "SuperResolution"]
categories = ["Graphics"]
date = "2017-03-06T12:53:31+09:00"
title = "エッジ補完アルゴリズム FCBI (Fast curvature based interpolation) 前編:デモプログラムの使い方"

+++

# はじめに

インターフェース誌2015年6月号「超解像アルゴリズム」の記事を元に JavaScript で FCBI のデモを実装したので、今回はその使い方の解説です。(次回はアルゴリズム詳解の予定)

あと、エッジ判定型の超解像だと ICBI や iNEDI といったより良い手法もありますが、とりあえず今回は FCBI です。アルゴリズムが単純なのでソースコードを読むには良いと思います。

# デモ

- http://app.awm.jp/image.js/fcbi.html
  - ソースコード: https://github.com/yoya/image.js/blob/master/fcbi.js (アルゴリズムに対応する function は drawFCBI_Phase[123] です)

仕様: (w) x (h) サイズの画像を (2w-1) x (2h-1) にします。例えば100x100画像は 199x199に拡大します。

制限事項: 画像の一片は maxWidthHeight で指定できますが、 その最大値を 1000px 制限してます。そのうち上限を増やすかも。

## 使い方

同じ実験するのならできる限り可愛い絵の方が頑張れるので、こちらの世界一可愛いミクさん絵で綺麗な拡大を試みます。

 https://twitter.com/rityulate/status/772006898279120896

### (1) 画像をドロップして渡す

ブラウザに PNG, JPEG, GIF あたりの画像をドロップすると、とりあえず変換されます。

<center> <a href="../demo00.png"> <img src="../demo00-h.png" /> </a></center>

初期状態では画像の一片を320pxに制限しています。

### (2) edge モードで輪郭が期待通りに出るよう TM 値を調整

<center> <a href="../demo01.png"> <img src="../demo01-h.png" /> </a> </center>

尚、イラストだと大抵は小さい値にすれば良いのですが、自然画だと調整が難しいです。

### (3) maxWidthHeight を最大値にする

<center> <a href="../demo02.png"> <img src="../demo02-h.png" /> </a> </center>

輪郭が期待と違う場合は TM を再調整。

### (4) edge を外して完成

<center> <a href="../demo03.png"> <img src="../demo03-h.png" /> </a> </center>

# 既存の方法と比較

画像の一部に注目して拡大結果を比較します。

<img src="../miku.png" />

```
% convert miku.png -filter box      -resize 200%x200% miku-box.png # N-Neighbor
% convert miku.png -filter triangle -resize 200%x200% miku-triangle.png # Bi-Linear
% convert miku.png -filter cubic    -resize 200%x200% miku-cubic.png
% convert miku.png -filter mitchell -resize 200%x200% miku-mitchell.png
% convert miku.png -filter lanczos  -resize 200%x200% miku-lanczos.png
```
ちなみに ImageMagick の -resize デフォルトは Mitchell フィルタです。

Nearest-Neighbor | Bi-Liner | Bi-Cubic |
----------------|----------|----------|
<img src="../miku-box.png"/>|<img src="../miku-triangle.png"/>|<img src="../miku-cubic.png"/>|
Lanczoz | Mitchell | FCBI |
<img src="../miku-lanczos.png"/>|<img src="../miku-mitchell.png"/>|<img src="../miku-fcbi.png"/>|

Lanczos も良い勝負してますが、FCBI の方がドット感が消えて線が自然に繋がっているように見えます。

# 最後に

レベル補正で正規化したピクセルを元にエッジ判定すれば、TM はもう少し適当で良いかもしれません。

次回で、自分なりにアルゴリズムを解説し直す予定です。インターフェース誌の解説だと多分、慣れてる人じゃないと l って具体的に何？テンソル積記号出てきたけどどうすれば良いの？で止まるはずなので。その辺りの補足説明をしたいかも。

# 参考

- Interface 2015年6月号 (CQ出版)
  -  http://www.kumikomi.net/interface/contents/201506.php
- Comparative Analysis of Edge Based Single Image Superresolution
  - http://ijcttjournal.org/Volume10/number-5/IJCTT-V10P146.pdf
