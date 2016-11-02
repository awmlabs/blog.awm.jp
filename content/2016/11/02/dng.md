+++
categories = ["DNG"]
date = "2016-11-02T21:09:00+09:00"
draft = false
tags = ["DNG", "ICC", "JPEG"]
title = "DNG から ICC プロファイル付き JPEG 画像を作る"

+++

# はじめに

## 利用するもの

- PC (MacBook Pro)

以下のどちらか

- Adobe Lightroom CC
- Adobe Photoshop CC

## DNG 画像の入手法

iPhone7 Plus から DNG 画像を取り出す方法はこちらにまとめました。

- iPhone7 Plus で撮影した DNG 画像を PC に取り出す方法
  - http://blog.awm.jp/2016/11/01/dng/

この DNG 画像から ICC プロファイル付きで JPEG 画像を生成する方法のメモ書きです。
一行でまとめると。
```
プリンタの設定でプロファイルを選択してJPEGファイル出力する。
```

# Adobe Lightroom を使う場合

Adobe Cloud で同期するとコレクションに画像が入るので、そこから選択する。

<center>
  <a href="../lightroom01.png"> <img src="../lightroom02-1.png"> </a>
</center>

メニューのウィンドウからプリントを選択して、
右端のスクロールバーを一番下まで下げると、カラーマネジメントのパネルが出てくる。

<center>
  <a href="../lightroom02.png"> <img src="../lightroom02-h.png"> </a>
</center>

あとは、カラーマネジメントのプロファイルを適当に選択して、右下の「ファイルへ出力」ボタンを押して保存すればOK

# Adobe Photoshop を使う場合

DNG 画像を開いて、左下の「画像を保存」ボタンを押します。

<center>
  <a href="../photoshop01.png"> <img src="../photoshop01-45p.png"> </a>
</center>

以下の保存オプションで選択

- ファイル形式に JPEG
- カラースペースに適当なプロファイル

<center>
  <a href="../photoshop02.png"> <img src="../photoshop02-30p.png"> </a>
</center>

あとは右上の保存を押すだけ。
