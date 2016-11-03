+++
categories = ["RAW"]
date = "2016-11-03T21:06:03+09:00"
draft = false
tags = ["DNG", "RAW"]
title = "DNG 画像とは"

+++

# DNG 画像とは？

Adobe 社が規格した画像形式で、RAW 画像の一種です。

- Photoshop ヘルプ / Digital Negative （DNG）
  -  https://helpx.adobe.com/jp/photoshop/digital-negative.html

RAW 画像は、カメラメーカーが各々独自の規格を出していますが、それらに対しての統一フォーマット的な意味合いもあります。

# RAW 画像とは？

JPEG の形式を使わず、デジタルカメラの CCD や CMOS センサで採れたデータを、なるべくそのままに記録するものです。

<center> <img src="../figure01.png" > </center>

図の解説。

- デモザイク：画像センサーは一般的なモニタのようなRGB配列ではない事が通常なので、センサーの物理的配置から格子状のビットマップ各座標のRGB値を算出します
- 色変換：一般的なモニタの色域やガンマ値等の特性に合わせて RGB値を補正します。いわゆるカラーマネジメントです。また8bitで量子化し直します。
- 圧縮：人間の目があまり気にしない情報を落とし、エントロピー圧縮をかけて、ファイルサイズを減らします。主に高周波成分を切り落とし、YCbCr でのクロマサブサンプリングを行う事もあります。

JPEG は圧縮レベルによって画像が劣化します、例え圧縮をしなくても、そもそも古い時代の規格の為、輝度のダイナミックレンジや色域、またサンプリング量子化の粒度等で妥協した状態で画像データを記録します。


## メリット

例えば、(デジタル)現像と呼ばれる作業で以下の事ができます。

- 輝度の高い(明るい)方から低い(暗い)ところまで情報を残しているので、保存されている DNG データを元に、好きな露出で JPEG に変換できます
- ホワイトバランスを指定して JPEG に変換できます
- JPEG 画像に対してだと色フィルタを強くかけるとアラが目出ちますが、自然な階調のまま変換できます

## デメリット

- (JPEG保存に比べて) ファイルサイズが大きくなる
- DNG ファイルを投稿できないサイトが多い
- DNG ファイルの画像を表示できない環境が多い
- 撮影がもっさりして連写がしにくいらしい

## 蛇足

ちなみに大昔、圧縮せずに R,G,B を並べただけの画像を RAW 形式と読んでいた事もあると聞くので、古いドキュメントを見るときは注意が必要かもしれません

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

以下のサイトも参考にして下さい。大量の種類があります。

- RAWSAMPLES.CH
  -  https://en.wikipedia.org/wiki/List_of_cameras_supporting_a_raw_format

# RAW 画像の現像ツール

RAW 画像を JPEG 等に変換するツールを(デジタル)現像ツールと呼びます。
各社で独自の RAW 形式をもつので、各々の形式に応じた現像ツールが提供されています。
尚、DNG の場合は Adobe Lightroom で「現像」できます。

参考) http://blog.awm.jp/2016/11/02/dng/

## その他現像ツール

フリーソフトでは UFRaw と Dcraw が有名です。
例えば、UFRaw は以下のように使います。
```
ufraw-batch -create-id=yoya --out-type=png --out-depth=16 --output=out.png input.dng
```

- フリー な RAW 現像 ソフト の まとめ
  -  https://sites.google.com/site/freerawconverter/Home

尚、Google Photo サービスでは RAW 画像を投稿できます。又、インライン画像を保存すると JPEG として取り出せます。

- 実は、GoogleフォトだってRAWに対応しているぞ
  - http://hokoxjouhou.blog105.fc2.com/blog-entry-489.html

# 参考 URL

- RAW画像はどのように圧縮されているか
  - http://cygx.mydns.jp/blog/?arti=431
