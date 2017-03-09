+++
date = "2017-03-08T14:11:00+09:00"
draft = false
tags = ["FCBI", "SuperResolution"]
categories = ["Graphics"]
title = "エッジ判定型超解像アルゴリズム FCBI (Fast curvature based interpolation) 後編:アルゴリズム詳解"
+++

# はじめに

インターフェース誌2015年6月号「超解像アルゴリズム」の記事を元に、全面的に*自分が*分かりやすいように解説し直します。

ICBI や iNEDI といったより良い手法もありますが、FCBI はそれらより処理が軽いので使い道はありますし、ICBI は FCBI をベースにしているので、知っておいて損はないです。

尚、こちらのエントリの続きです。

- エッジ判定型超解像アルゴリズム FCBI (Fast curvature based interpolation) 前編:デモプログラムの使い方
  - https://blog.awm.jp/2017/03/07/fcbi/
     - https://app.awm.jp/image.js/fcbi.html (デモ)

デモを見た方が実感が湧くはずですので、この記事を読む前に出来ればお試しください。

# アルゴリズム概要

## ポイント

- エッジが残るように勾配の少ない軸方向で補間する。
- 倍のサイズ(正確には倍-1)への拡大のみ。スケール微調整は不可。
  -  尚、公式の参照実装(icbi.m)は 2*n-1 倍)に対応してます。
- 画像によって適切な値が異なる閾値 TM を調整する必要がある。手動なり自動なり。
- モノクロ画像のアルゴリズム。つまり色差は見ない。
- イラスト画像は少し苦手 (最後の方で解説)

## 実装のポイント

### カラー対応

FCBI はモノクロ画像のアルゴリズムなので、カラフルな画像に対応する為に RGBA から計算した輝度 Y を用います。JPEG の YCbCr の計算式を元にしました。

- https://github.com/yoya/image.js/blob/v1.2/fcbi.js#L75
{{< highlight javascript >}}
function lumaFromRGBA(rgba) {
    var [r,g,b,a] = rgba;
    var y = 0.299 * r + 0.587 * g + 0.114 * b;
    return y * a / 255;
}
{{< /highlight >}}

### フィルタ行列

インターフェース誌の記事だと非エッジの勾配を調べる演算がフィルタ行列とのテンソル積(<img src="../tensor_product.png" alt="バツをマルで囲う記号" align=center />)で示されますが、単なる畳み込みの計算なのでプログラム的には簡単です。

- https://github.com/yoya/image.js/blob/v1.2/fcbi.js#L85
{{< highlight javascript >}}
function convolveFilter(imageData, x, y, posi, filter) {
    var h = 0;
    for (var i = 0, n = posi.length ; i < n ; i++) {
	var [dx, dy] = posi[i];
	h += getLuma(imageData, x + dx, y + dy) * filter[i];
    }
    return h;
}
{{< /highlight >}}

### abs - H1, H2

インターフェース誌の記事も FCBI を説明する様々な論文も端折ってますが非エッジの勾配を比較するのは、H1 < H2 でなく abs(H1) < abs(H2) です。
直感的にも abs を取らないと白い塗りと黒い塗りで結果が変わりますし、参照実装(icbi.m)で abs で括っているのも確認済みです。

- https://github.com/yoya/image.js/blob/v1.2/fcbi.js#L234
{{< highlight javascript >}}
if (Math.abs(H1) < Math.abs(H2)) {
	var rgba = meanRGBA(rgba1, rgba4);
} else {
	var rgba = meanRGBA(rgba2, rgba3);
}
{{< /highlight >}}

## 既存のメソッドとの比較

画像の拡大では、ピクセルを広げて出来た隙間をどう埋めるのかが勝負です。

<img src="../3x2test-Dotty.png" />  <img src="../5x3testPhase1-Dotty.png" />

### Nearest-Neighbor

近隣(Nearest-Neighbor)のピクセルをコピーします。

<img src="../5x3test-NN-Dotty.png" />

ちなみに丁度2倍の 6x4 だとこうなります。

<img src="../6x4test-NN-Dotty.png" />

### Bi-Linear

線形(Linear)の計算で補間します。中学校で習う a と b の間の p 点 みたいな計算です。この例だと隣のピクセルを足して割る。つまり4隅または隣2つの平均値を用います。

<img src="../5x3test-BL-Dotty.png" />

RGB 値が色味に対して線形では無いので違和感のある結果ですが、そこは目を瞑って頂ければ。。RGB の数値的にはちゃんと平均、真ん中の値です。

### FCBI

Bi-Linear の亜種とも言えます。Bi-Linear だと単純に上下左右の４つから混ぜますが、FCBI ではエッジをなるべく残すよう、４つのうち２つを選択して混ぜます。

# FCBI の全体的な流れ

３つのフェーズで処理します。
Phase1 と Phase2 は同時に実行できますが、分かりやすいよう便宜的に分けます。

元画像 | Phase1 |
---|---|
<img src="../3x2test-Dotty.png" /> | <img src="../5x3testPhase1-Dotty.png" /> |
Phase2| Phase3 |
<img src="../5x3testPhase2-Dotty.png" /> | <img src="../5x3testPhase3-Dotty.png" /> |

## 大まかなアルゴリズム

詳細は後で、まず処理の大雑把な流れです。

### Phase1

- ピクセルを2倍の座標で再配置する

### Phase2

- 斜め隣を見てエッジかどうか判定する
  - 非エッジの場合
     - 周辺８ピクセルから勾配を判断して、勾配が少ない方の２ピクセルを混ぜる
  - エッジの場合
     - 斜めの２軸のうち勾配が少ない方の２ピクセルを混ぜる
     
### Phase3

- 上下左右を見てエッジかどうか判定する
  - 非エッジの場合
     - 周辺８ピクセルから上下左右の勾配を判断して、勾配が少ない方の２ピクセルを混ぜる
  - エッジの場合
     - 上下、左右の２軸のうち勾配が少ない方の２ピクセルを混ぜる

## サンプル画像

実際の画像に適用するとこんな感じです。

<img src="../Opaopa-Dotize.png" />

### Phase1: ピクセルを拡げる

<img src="../OpaopaPhase1-Dotize.png" />

### Phase2: 斜め方向からピクセルを埋める

<img src="../OpaopaPhase2-Dotize.png" />

### Phase3: 縦横方向からピクセルを埋める

<img src="../OpaopaPhase3-Dotize.png" />

# 各 Phase の詳細

## Phase1: ピクセルを拡げる

単純にピクセルを2倍の座標で配置し直します。

<img src="../3x3test-Dotty.png" />  <img src="../3x3testPhase1-Dotty.png" />

- https://github.com/yoya/image.js/blob/v1.2/fcbi.js#L181
   - 読み易くする為、エッジ表示モード(edgeMode) の処理は外してます
{{< highlight javascript >}}
function drawFCBI_Phase1(srcImageData, dstImageData, edge) {
    var dstWidth = dstImageData.width, dstHeight = dstImageData.height;
    for (var dstY = 0 ; dstY < dstHeight ; dstY+=2) {
        for (var dstX = 0 ; dstX < dstWidth ; dstX+=2) {
	    var srcX = dstX / 2;  // srcX * 2 = dstX
	    var srcY = dstY / 2;
	    var rgba = getRGBA(srcImageData, srcX, srcY);
	    setRGBA(dstImageData, dstX, dstY, rgba);
	}
    }
}
{{< /highlight >}}

この手の処理は dstImage の縦横座標を元にループ処理をして、srcImage の対応する色を引っ張ってくるのが王道です。
ただ、今回のケースは丁度2倍でキリが良いので srcImage でループしても良いです。

- もう一つの方法
{{< highlight javascript >}}
function drawFCBI_Phase1(srcImageData, dstImageData, edge) {
    var srcWidth = srcImageData.width, srcHeight = srcImageData.height;
    for (var srcY = 0 ; srcY < srcHeight ; srcY+=1) {
        for (var srcX = 0 ; srcX < srcWidth ; srcX+=1) {
	    var dstX = srcX * 2;  // srcX * 2 = dstX
	    var dstY = srcY * 2;
	    var rgba = getRGBA(srcImageData, srcX, srcY);
	    setRGBA(dstImageData, dstX, dstY, rgba);
	}
    }
}
{{< /highlight >}}

srcImage と dstImage の座標変換が整数倍じゃない時に破綻するので、習慣として自分は dstX, dstY でループしてます。(まぁ性能次第で適当に切り替えましょう)

## Phase2: 斜め方向からピクセルを埋める

### エッジ判定

隣り合うピクセルの輝度に急激な変化がなければ、非エッジだと判定します。

- https://github.com/yoya/image.js/blob/v1.2/fcbi.js#L204
{{< highlight javascript >}}
/*  l1     l2
 *      x  
 *  l3     l4
 */
var rgba1 = getRGBA(dstImageData, dstX-1, dstY-1);
var rgba2 = getRGBA(dstImageData, dstX+1, dstY-1);
var rgba3 = getRGBA(dstImageData, dstX-1, dstY+1);
var rgba4 = getRGBA(dstImageData, dstX+1, dstY+1);
var l1 = lumaFromRGBA(rgba1); // RGBA から輝度 Y を算出
var l2 = lumaFromRGBA(rgba2);
var l3 = lumaFromRGBA(rgba3);
var l4 = lumaFromRGBA(rgba4);
var V1 = Math.abs(l1 - l4);   // 斜め方向の勾配
var V2 = Math.abs(l2 - l3);
var p1 = (l1 + l4) / 2;       // 斜め隣の平均
var p2 = (l2 + l3) / 2;       // つまり p1 - p2 は斜め２軸の勾配
if ((V1 < TM) && (V2 < TM) && (Math.abs(p1 - p2) < TM)) {
   // 非エッジとして処理
} else {
   // エッジとして処理
}
{{< /highlight >}}


### エッジの場合

斜め２軸の隣どうしを見て、その勾配が少ない方の２ピクセルを線形補完します。

- https://github.com/yoya/image.js/blob/v1.2/fcbi.js#L244
{{< highlight javascript >}}
if (V1 < V2) { // V1:abs(l1 - l4),  V2:abs(l2 - l3)
    var rgba = meanRGBA(rgba1, rgba4); // l1, l4 の中間の値
} else{
    var rgba = meanRGBA(rgba2, rgba3);
}
{{< /highlight >}}

### 非エッジの場合

エッジの場合より少し複雑です。
補完するピクセルをどれにするか判断するのに、斜め２軸の隣どうしだけでなく、少し多めのピクセルを見ます。

- https://github.com/yoya/image.js/blob/v1.2/fcbi.js#L224
{{< highlight javascript >}}
var H1 = convolveFilter(dstImageData, dstX, dstY,
			    [[-3, 1], [-1,-1], [1, -3],  // 1, 2, 3
			     [-1, 1],          [1, -1],  // 4,    5
			     [-1, 3], [ 1, 1], [3, -1]], // 6, 7, 8
			    [1, 1, 1, -3, -3, 1, 1, 1]); // filter
var H2 = convolveFilter(dstImageData, dstX, dstY,
			    [[-1, -3], [1, -1], [3, 1],  // 1, 2, 3
			     [-1, -1],          [1, 1],  // 4,    5
			     [-3, -1], [-1, 1], [1, 3]], // 6, 7, 8
			    [1, 1, 1, -3, -3, 1, 1, 1]); // filter
if (Math.abs(H1) < Math.abs(H2)) {
	var rgba = meanRGBA(rgba1, rgba4);
} else {
	var rgba = meanRGBA(rgba2, rgba3);
}
{{< /highlight >}}

## Phase3: 縦横方向からピクセルを埋める

Phase2 とほぼ同じ処理です。斜め方向を縦横に変えただけ。

### エッジ判定

- https://github.com/yoya/image.js/blob/v1.2/fcbi.js#L263
{{< highlight javascript >}}
/*     l2
 *  l1  x  l4
 *     l3
 */
var rgba1 = getRGBA(dstImageData, dstX-1, dstY);
var rgba2 = getRGBA(dstImageData, dstX  , dstY-1);
var rgba3 = getRGBA(dstImageData, dstX  , dstY+1);
var rgba4 = getRGBA(dstImageData, dstX+1, dstY);
var l1 = lumaFromRGBA(rgba1);
var l2 = lumaFromRGBA(rgba2);
var l3 = lumaFromRGBA(rgba3);
var l4 = lumaFromRGBA(rgba4);
var V1 = Math.abs(l1 - l4);
var V2 = Math.abs(l2 - l3);
var p1 = (l1 + l4) / 2;
var p2 = (l2 + l3) / 2;
if ((V1 < TM) && (V2 < TM) && (Math.abs(p1 - p2) < TM)) {
   // 非エッジとして処理
} else {
   // エッジとして処理
}
{{< /highlight >}}

### エッジの場合

- https://github.com/yoya/image.js/blob/v1.2/fcbi.js#L303
{{< highlight javascript >}}
if (V1 < V2) { // V1:abs(l1 - l4),  V2:abs(l2 - l3)
	var rgba = meanRGBA(rgba1, rgba4);
} else{
	var rgba = meanRGBA(rgba2, rgba3);
}
{{< /highlight >}}

### 非エッジの場合

- https://github.com/yoya/image.js/blob/v1.2/fcbi.js#L283
{{< highlight javascript >}}
var H1 = convolveFilter(dstImageData, dstX, dstY,
			    [[1, -2], [1, 0], [1, 2],    // 1, 2, 3
			     [0, -1],         [0, 1],    // 4,    5
			     [-1,-2], [-1,0], [-1, 2]],  // 6, 7, 8
			    [1, 1, 1, -3, -3, 1, 1, 1]); // filter
var H2 = convolveFilter(dstImageData, dstX, dstY,
			    [[-2,-1], [0,-1], [2, -1],   // 1, 2, 3
			     [-1, 0],         [1,  0],   // 4,    5
			     [-2, 1], [0, 1], [2,  1]],  // 6, 7, 8
			    [1, 1, 1, -3, -3, 1, 1, 1]); // filter
if (Math.abs(H1) <= Math.abs(H2)) {
	var rgba = meanRGBA(rgba1, rgba4);
} else {
	var rgba = meanRGBA(rgba2, rgba3);
}
{{< /highlight >}}

# FCBI の弱点

FCBI は width:1 の線が苦手です。実写の画像だと殆ど問題ないのですが、イラストだと結構このパターンが出てきます。

   テスト画像                |     ドット拡大表示        |
-----------------------------|---------------------------|
 <img src="../test00.png" /> | <img src="../test00-dotty.png" /> |
 <img src="../test01.png" /> | <img src="../test01-dotty.png" /> |
 <img src="../test02.png" /> | <img src="../test02-dotty.png" /> |
 <img src="../test03.png" /> | <img src="../test03-dotty.png" /> |

これは補間するピクセルを決定する際に、
{{< highlight javascript >}}
/*  l1     l2
 *      x  
 *  l3     l4
 */
if (V1 < V2) { // V1:abs(l1 - l4),  V2:abs(l2 - l3)
	var rgba = meanRGBA(rgba1, rgba4);
} else{
	var rgba = meanRGBA(rgba2, rgba3);
}
{{< /highlight >}}

単色塗りに width:1 の線が斜めに伸びる時、
V1(上記の例だと白-白) と V2（黒-黒) が同じ為に、
どちらを補間すれば良いのか判断がつきません。

(図、2x2 の白黒チェックを 3x3 に引き伸ばした図)

とりあえず l2, l3 (右肩上がりの斜め)を使ってしまいます。

つまり、フラットな塗りの上に右肩下がりの細い線があると、そこをうまく補間できないという事です。

# さいごに

思った事をつらつらと。
- 輝度Yでなく色差も使った方が良い気がする
- 単色塗りの上に width:1 の線があると破綻するので、V1 == V2 の時は非エッジのようなもう少し広い範囲のピクセルから判断するか。いっその事 Bi-Linear にように4方を混ぜる方がマシなのでは
- FCBI のせいでは無いけれど、JPEG 画像のモアレが余計に見えるようになって、悲しい事もある

漏れや間違いに気付き次第、全部直します。ご指摘頂けると幸いです。

# 参考

- Interface 2015年6月号 (CQ出版)
  -  http://www.kumikomi.net/interface/contents/201506.php
- ICBI page
  -  http://www.andreagiachetti.it/icbi/
- Real time artifact-free image upscaling
   -  http://www.andreagiachetti.it/icbi/InterTIPmod2c.pdf
- Comparative Analysis of Edge Based Single Image Superresolution
  - http://ijcttjournal.org/Volume10/number-5/IJCTT-V10P146.pdf
- Parameter Optimization Of Fast Curvature Based Interpolation Using Genetic Algorithm
   - https://pdfs.semanticscholar.org/a61c/d74eefae6283f5d88ade1e241890f192d458.pdf
