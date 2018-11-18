+++
title = "ImageMagick7 negate (negative / positive conversion) invert transparency as default"
date = 2018-11-18T01:45:11+09:00
categories = []
tags = []
draft = false
+++

- https://qiita.com/yoya/items/9301c447093354d92185 (original text as japanese)

# ImageMagick7 negate (nega/posi-trans) is wrong

When using the -negate option with ImageMagick7, images may disappear sometimes.

## Actual operation

There is no problem if it is an RGB image without transparency.

```
% convert rose: rose.png
% identify -verbose rose.png | grep Type
  Type: TrueColor
% convert rose.png -negate rose-negate.png
```
|rose.png | rose-negate.png|
|---|---|
| <img src="../rose.png" /> |<img src="../rose-negate.png" /> |

If it is an RGBA image with transparency, ...

```
% convert rose: -matte rose-matte.png
% identify -verbose rose-matte.png | grep Type
  Type: TrueColorAlpha
% convert rose-matte.png -negate rose-matte-negate.png
```
|rose-matte.png | rose-matte-negate.png|
|---|---|
| <img src="../rose-matte.png" /> |<img src="../rose-matte-negate.png" /> |

This is because the alpha value is also negated from A: 255(opaque) to A:0 (transparent).

ImageMagick6 negate, there is no problem.

```
% convert6 rose-matte.png -negate rose-matte-negate6.png
```
|rose-matte.png | rose-matte-negate6.png|
|---|---|
| <img src="../rose-matte.png" /> |<img src="../rose-matte-negate6.png" /> |

## Workaround or Expcted Usage ?

By specifying -channel RGB, negate only RGB, A can go through.
ImageMagick6 can also behave like ImageMagick7 by specifying -channel RGBA.

```
% convert rose-matte.png -channel RGB -negate rose-matte-negate-rgb.png
% convert6 rose-matte.png -channel RGBA -negate rose-matte-negate-rgba6.png
```

|rose-matte-negate-rgb.png|rose-matte-negate-rgba6.png|
|---|---|
| <img src="../rose-matte-negate-rgb.png" /> |<img src="../rose-matte-negate-rgba6.png" /> |

Also, it seems that it is possible to specify all color components except A.

```
% convert rose-matte.png -channel 'All,!A' -negate rose-matte-negate-all-A.png
```

|rose-matte-negate-all-A.png|
|---|
| <img src="../rose-matte-negate-all-A.png" /> |

## Consideration

It is probably because ImageMagick7 abstracts color components as "channel" and does not distinguish between RGB and A, but there is a documentual discrepancy.

- https://imagemagick.org/script/command-line-options.php#negate

```
The red, green, and blue intensities of an image are negated.
```
What about calling alpha values ​​as intensities(color component strength)? But I can not say anything.
However, the explanation of color_mods is clearly different from the actual operation.

- https://www.imagemagick.org/Usage/color_mods/#negate

```
by default ignores the alpha channel.
```

This is the behavior of ImageMagick6.

## Last

I can't guess the intentional behavior, so I'd like to ask the official side for a while.
It is hard to use A as it invert by default, and even if it's intentional, I want a note in the manual.
