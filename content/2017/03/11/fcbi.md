+++
categories = ["Graphics"]
date = "2017-03-11T21:37:25+09:00"
draft = false
tags = ["FCBI", "SuperResolution"]
title = "エッジ判定型超解像アルゴリズム FCBI (Fast curvature based interpolation) おまけ:アルゴリズム改造"
+++

# はじめに

この記事の続きです。

- エッジ判定型超解像アルゴリズム FCBI (Fast curvature based interpolation) 後編:アルゴリズム詳解
  - https://blog.awm.jp/2017/03/08/fcbi/

弱点の部分を改造したら、なんとなく良い結果を得られたので、その説明です。

# 弱点

勾配のないフラットな塗りに、右下向きの width:1 の線があると補間が崩れます。

   テスト画像                |     ドット拡大表示        |
-----------------------------|---------------------------|
 <img src="../test00.png" /> | <img src="../test00-dotty.png" /> |
 <img src="../test01.png" /> | <img src="../test01-dotty.png" /> |
 <img src="../test02.png" /> | <img src="../test02-dotty.png" /> |
 <img src="../test03.png" /> | <img src="../test03-dotty.png" /> |


## 改造 take1

v1 と v2 の値が近い時は、単純な Bi-Linear にように4隅を混ぜた方がマシになります。

- https://github.com/yoya/image.js/blob/v1.3/fcbi.js#L241
{{< highlight javascript >}}
if (Math.abs(v1 - v2) < TM)  { // yoya custom
    var rgba = meanRGBA(meanRGBA(rgba1, rgba4), meanRGBA(rgba2, rgba3));
} else {
    if (v1 < v2) {
        var rgba = meanRGBA(rgba1, rgba4);
    } else {
        var rgba = meanRGBA(rgba2, rgba3);
    }
}
{{< /highlight >}}

結果。

   テスト画像                |     ドット拡大表示        |
-----------------------------|---------------------------|
 <img src="../test00.png" /> | <img src="../test00-dotty.png" /> |
 <img src="../testYoya-Phase1.png" /> | <img src="../testYoya-Phase1-Dotty.png" /> |
 <img src="../testYoya-Phase2.png" /> | <img src="../testYoya-Phase2-Dotty.png" /> |
 <img src="../testYoya-Phase3.png" /> | <img src="../testYoya-Phase3-Dotty.png" /> |

実際のイラストでも線が途切れる箇所が減っています。

   元画像                |   オリジナル     | 改造版 |
-------------------------|---------------------------|---|
<img src="../miku.png" />|<img src="../miku-v1.0.png" /> |<img src="../miku-v1.2.png" />
- copyright: https://twitter.com/rityulate/status/772006898279120896

## 改造 take2

エッジ判定になっても v1(1-4) と v2(2-3) の差がない時は非エッジとして処理する改造をしたら、いい感じになりました。

- https://github.com/yoya/image.js/blob/v1.3/fcbi.js#L241
{{< highlight javascript >}}
if (((v1 < TM) && (v2 < TM) && (Math.abs(p1 - p2) < TM)) ||
    (Math.abs(v1 - v2) < TM)) { // yoya custom
    if (edgeMode) {
        var rgba = [0, 128, 0, 255]; // green
    } else {
        // 非エッジの処理
{{< /highlight >}}

- 結果

   テスト画像                |     ドット拡大表示        |
-----------------------------|---------------------------|
 <img src="../test00.png" /> | <img src="../test00-dotty.png" /> |
 <img src="../testYoya2-Phase1.png" /> | <img src="../testYoya2-Phase1-Dotty.png" /> |
 <img src="../testYoya2-Phase2.png" /> | <img src="../testYoya2-Phase2-Dotty.png" /> |
 <img src="../testYoya2-Phase3.png" /> | <img src="../testYoya2-Phase3-Dotty.png" /> |

実際のイラストでも線が途切れる箇所が減っています。

オリジナル     | 改造 take1 | 改造 take2 |
-------------------------|-----------------------|----------|
<img src="../miku-v1.0.png" /> |<img src="../miku-v1.2.png" /> | <img src="../miku-v1.4.png" /> |

- copyright: https://twitter.com/rityulate/status/772006898279120896

# まとめ

- イラストだとそのままのアルゴリズムより、少し弄って使った方が良さそう
- 非エッジの処理でもエッジは残せるので、おそらく高速化の為に分けてると思われる
- 分岐がもったいない環境だと、全部非エッジとして処理した方が速いかも。

