+++
categories = ["RAW"]
date = "2016-11-03T21:06:03+09:00"
draft = false
tags = ["DNG", "RAW"]
title = "DNG 画像とは"

+++

# DNG 画像とは？

Adobe さんが規格した RAW 画像フォーマットの一種です。

- Photoshop ヘルプ / Digital Negative （DNG）
  -  https://helpx.adobe.com/jp/photoshop/digital-negative.html

カメラメーカーが各々独自の RAW 規格を出していますが、それらに対しての統一フォーマット的な意味合いもあります。

# RAW 画像とは？

JPEG の形式を使わず、デジタルカメラの CCD や CMOS センサの取れたデータを、なるべくそのまま記録するものです。

<center> <img src="../figure01.png" > </center>

図の解説。

- デモザイク：画像センサーは一般的なモニタのようなRGBではない事が通常なので、センサーの物理的配置から格子状の各座標のRGB値を算出します。
- 色変換：一般的なモニタの色域に合わせて R,G,B の値を決定します。いわゆるカラーマネジメントです。
- 圧縮：人間の目があまり気にしない情報(主に高周波成分)を落とし、エントロピー圧縮をかけて、ファイルサイズを減らします。

JPEG は圧縮レベルによって画像が劣化する事は知られていますが、例え圧縮を殆どしなくても、そもそも古い時代の規格の為、輝度のダイナミックレンジや色域、またサンプリング量子化の粒度等で、妥協した状態で保存しています。

(ちなみに大昔、圧縮せずに R,G,B を並べただけの画像を RAW 形式と読んでいた事もあると聞くので、古いドキュメントを見るときは注意が必要かもしれません)

## メリット

例えば、(デジタル)現像と呼ばれる作業で以下の事ができます。

- 輝度の高い(明るい)方から低い(暗い)ところまで情報を残しているので、保存されている DNG データを元に、好きな露出で JPEG に変換できます。
- ホワイトバランスを指定して JPEG に変換できます。
- JPEG 画像に対してだと色フィルタを強くかけるとアラが目出ちますが、自然な階調のまま変換できます

## デメリット

- (JPEG保存に比べて) ファイルサイズが大きくなる
- DNG ファイルを投稿できないサイトが多い
- DNG ファイルの画像を表示できない環境が多い

# RAW 画像にどんなのがある？

幾つか列挙します。

- Adobe: DNG
- Sony: ARW
- Nikon: NEF
- Fujifilm: RAF
- Sigma: V3, X3F
- Canon: CR2
- Panasonic: RW2
- Hasselblad: 3FR

# RAW 画像の現像ツール

RAW 画像を JPEG 等に変換するツールを(デジタル)現像ツールと呼びます。
各社、(デジタル)現像ツールとして RAW => JPEG 変換ソフトを提供してます。
DNG の場合は Adobe Lightroom が使えます。

## その他現像ツール

フリーソフトでは UFRaw と Dcraw が有名です。
例えば、UFRaw は以下のように使います。
```
ufraw-batch -create-id=yoya --out-type=png --out-depth=16 --output=out.png input.dng
```

尚、Google Photo サービスでは RAW 画像を投稿できます。又、インライン画像を保存すると JPEG として取り出せます。

# 参考 URL

- RAW画像はどのように圧縮されているか
  - http://cygx.mydns.jp/blog/?arti=431
- 実は、GoogleフォトだってRAWに対応しているぞ
  - http://hokoxjouhou.blog105.fc2.com/blog-entry-489.html
- フリー な RAW 現像 ソフト の まとめ
  -  https://sites.google.com/site/freerawconverter/Home
- RAWSAMPLES.CH
  -  https://en.wikipedia.org/wiki/List_of_cameras_supporting_a_raw_format
