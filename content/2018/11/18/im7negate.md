+++
title = "ImageMagick7 negate(nega/posi-trans) invert transparency as default"
date = 2018-11-18T01:45:11+09:00
categories = []
tags = []
draft = false
+++

- https://qiita.com/yoya/items/9301c447093354d92185 (original text as japanese)

# ImageMagick7 negate(nega/posi-trans) invert transparency as default

When using the -negate option with ImageMagick7, images may disappear sometimes
.
This is the intended behavior, not a bug.

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

## Expcted Usage

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

## Examination

negate execution code is here.

- ImageMagick-7 MagickCore/enhance.c

```
MagickExport MagickBooleanType NegateImage(Image *image,
  const MagickBooleanType grayscale,ExceptionInfo *exception)
＜略＞
          for (j=0; j < (ssize_t) GetPixelChannels(image); j++)
          {
            PixelChannel channel = GetPixelChannelChannel(image,j);
            PixelTrait traits = GetPixelChannelTraits(image,channel);
            if ((traits & UpdatePixelTrait) == 0)
              continue;
            q[j]=QuantumRange-q[j];
          }
```

- ImageMagick6 magick/enhance.c

```
MagickExport MagickBooleanType NegateImage(Image *image,
  const MagickBooleanType grayscale)
{
  MagickBooleanType
    status;

  status=NegateImageChannel(image,DefaultChannels,grayscale);
  return(status);
}

MagickExport MagickBooleanType NegateImageChannel(Image *image,
  const ChannelType channel,const MagickBooleanType grayscale)
{
(omit)
          if ((channel & RedChannel) != 0)
            SetPixelRed(q,QuantumRange-GetPixelRed(q));
          if ((channel & GreenChannel) != 0)
            SetPixelGreen(q,QuantumRange-GetPixelGreen(q));
          if ((channel & BlueChannel) != 0)
            SetPixelBlue(q,QuantumRange-GetPixelBlue(q));
          if ((channel & OpacityChannel) != 0)
            SetPixelOpacity(q,QuantumRange-GetPixelOpacity(q));
          if (((channel & IndexChannel) != 0) &&
              (image->colorspace == CMYKColorspace))
            SetPixelIndex(indexes+x,QuantumRange-GetPixelIndex(indexes+x));
          q++;
```

The definition of DefaultChannels affecting these operations has changed to ImageMagick7.

- ImageMagick7 MagickCore/pixel.h

```
  AllChannels = 0x7ffffff,
  DefaultChannels = AllChannels
```

- ImageMagick6 magick/magick-type.h

```
  DefaultChannels = ((AllChannels | SyncChannels) &~ OpacityChannel)
```

ImageMagick6 does not include A with DefaultChannels "RGB, Sync", but ImageMagick7 definition has been changed to AllChannels and all RGBA is included in processing target as default.

## Consideration

It is the intended behavior, as shown in the porting manual, to handle alpha values by negate by default.

- https://imagemagick.org/script/porting.php#cli

```
Most algorithms update the red, green, blue, black (for CMYK), and alpha channels. Most operators will blend alpha the other color channels, but other operators (and situations) may require this blending to be disabled, and is currently done by removing alpha from the active channels via -channel option. (e.g. convert castle.gif -channel RGB -negate castle.png).
```

It seems that it is more convenient for most image processing algorithms to deal with four RGBAs equally, ImageMagick7 has changed DefaultChannels to include A. There are also inconvenient things like this negate, but on the whole it will be judged that this one is better.

- https://imagemagick.org/script/command-line-options.php#negate

```
The red, green, and blue intensities of an image are negated.
```
What about calling alpha values as intensities(color component strength)?
But I can't say anything.
However, the explanation of color_mods is clearly different from the actual operation.

- https://www.imagemagick.org/Usage/color_mods/#negate

```
by default ignores the alpha channel.
```

This is the behavior of ImageMagick6.

## Lastly

I also want other notes in the manual other than porting so it seems good to ask them on the official side.
