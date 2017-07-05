+++
date = "2017-03-21"
title = "Guetzli - Perceptual JPEG encoder (english)"
draft = true
tags = ["JPEG", "Graphics", "Guetzli"]
categories = ["JPEG"]
+++

# Official information

- https://github.com/google/guetzli
- Announcing Guetzli: A New Open Source JPEG Encoder
   - https://research.googleblog.com/2017/03/announcing-guetzli-new-open-source-jpeg.html
- Guetzli: Perceptually Guided JPEG Encoder
   - https://arxiv.org/abs/1703.04421v1
- Users prefer Guetzli JPEG over same-sized libjpeg
   - https://arxiv.org/abs/1703.04416v1

# Introduction

- Guetzli is a chicken race technology that degrades JPEG image data until it is unlikely that people will perceive perceptually.
- Butteraugli is used for the evaluation instead of human eyes. Although it often sees MSE, PNSR, SSIM in the paper of image processing, these are pretty good estimates, Butteraugli has human visual characteristics (for example, luminance and color tone are different indicators, color tone is the color difference axis of opposite color theory).

<center>
<img src="../opponent-color.jpg" /> <br />
(c) http://ieeexplore.ieee.org/ieee_pilot/articles/06/ttg2009061291/article.html
</center>

- It is common to change the JPEG quality to find trade-offs between image size and image quality, but it seems like a fully automatic version of it. In addition, it fine tuning DQT (quantization parameter for each frequency component).
- It is a method of generating JPEG repeatedly and repeatedly so as to hit a good result, so it takes very long time anyway. I can not supersede libjpeg or mozjpeg. We can reduce image size effective for important images with a lot of access. Usage like zopflipng looks good.

# Spec limitetions

It is a limitation noticed by reading the source. (I want you to write it in README.)

## quality >= 84

You can only specify quality of 84 or higher. If it is less than that, it seems to be visible and deteriorate. (By the way, the default is 95)

- guetzli/processor.cc
{{< highlight cpp >}}
bool Processor::ProcessJpegData(const Params& params, const JPEGData& jpg_in,
                                Comparator* comparator, GuetzliOutput* out,
                                ProcessStats* stats) {
(omit...)
if (params.butteraugli_target > 2.0f) {
    fprintf(stderr,
            "Guetzli should be called with quality >= 84, otherwise the\n"
            "output will have noticeable artifacts. If you want to\n"
            "proceed anyway, please edit the source code.\n");
    return false;
  }
{{< /highlight >}}

## CMYK not supported

Only YCbCr JPEG is supported. CMYK and (Adobe) CYYK are not supported yet.

- ref) https://blog.awm.jp/2016/02/06/ycbcr/ about YCbCr (japanese text)

- guetzli/processor.cc
{{< highlight cpp >}}
bool Processor::ProcessJpegData(const Params& params, const JPEGData& jpg_in,
                                Comparator* comparator, GuetzliOutput* out,
                                ProcessStats* stats) {
(omit...)
if (jpg_in.components.size() != 3 || !HasYCbCrColorSpace(jpg_in)) {
  fprintf(stderr, "Only YUV color space input jpeg is supported\n");
  return false;
}
{{< /highlight >}}

## YUV 444,420 only

Only YUV 444, 420 correspond. 422, 411, 440 are not supported.

- ref) https://blog.awm.jp/2016/02/10/yuv/ YUV notations (japanese text)

- guetzli/processor.cc
{{< highlight cpp >}}
bool Processor::ProcessJpegData(const Params& params, const JPEGData& jpg_in,
                                Comparator* comparator, GuetzliOutput* out,
                                ProcessStats* stats) {
(omit...)
  if (jpg_in.Is444()) {
    input_is_420 = false;
  } else if (jpg_in.Is420()) {
    input_is_420 = true;
  } else {
    fprintf(stderr, "Unsupported sampling factors:");
{{< /highlight >}}

Well. The JPEG of YUV 422 is supposed to be full of world, but is it all right? It seems to be much more than 420 something.
It seems to be 422 if it is an ordinary image quality setting with a digital camera.
(I am not interested only because I am interested only in high picture quality)

## Rumor (ICC profile)

There is a rumor that it does not inherit the ICC profile, but as long as I tried it I will take over properly.
Even if you look at the source code there is a process of copying APPn in its entirety.

- guetzli/jpeg_data_reader.cc
{{< highlight cpp >}}
// Saves the APP marker segment as a string to *jpg.
bool ProcessAPP(const uint8_t* data, const size_t len, size_t* pos,
                JPEGData* jpg) {
  VERIFY_LEN(2);
  size_t marker_len = ReadUint16(data, pos);
  VERIFY_INPUT(marker_len, 2, 65535, MARKER_LEN);
  VERIFY_LEN(marker_len - 2);
  // Save the marker type together with the app data.
  std::string app_str(reinterpret_cast<const char*>(
      &data[*pos - 3]), marker_len + 1);
  *pos += marker_len - 2;
  jpg->app_data.push_back(app_str);
  return true;
}
(omit...)
bool ReadJpeg(const uint8_t* data, const size_t len, JpegReadMode mode,
              JPEGData* jpg) {
(omit...)
case 0xe0:
      case 0xe1:
      case 0xe2:
      case 0xe3:
      case 0xe4:
      case 0xe5:
      case 0xe6:
      case 0xe7:
      case 0xe8:
      case 0xe9:
      case 0xea:
      case 0xeb:
      case 0xec:
      case 0xed:
      case 0xee:
      case 0xef:
        if (mode != JPEG_READ_TABLES) {
          ok = ProcessAPP(data, len, &pos, jpg);
        }
        break;
{{< /highlight >}}

- guetzli/jpeg_data_writer.cc
{{< highlight cpp >}}
bool EncodeMetadata(const JPEGData& jpg, bool strip_metadata, JPEGOutput out) {
  if (strip_metadata) {
1
  bool ok = true;
  for (int i = 0; i < jpg.app_data.size(); ++i) {
    uint8_t data[1] = { 0xff };
    ok = ok && JPEGWrite(out, data, sizeof(data));
    ok = ok && JPEGWrite(out, jpg.app_data[i]);
  }
{{< /highlight >}}

Can anyone have a JPEG file that does not inherit Exif or ICC profiles? (I'd like to make a bufix commit and get into my contributor!)

# Installation

If you use macOS, you can enter brew install guetzli, but it is a note of how to use the git repository.

Just get the package of libpng (libpng - dev) and gflags (libgflags - dev) and make it. It worked on macOS Sierra and Linux Ubuntu 16.

```
% git clone git@github.com:google/guetzli.git
% cd guetzli
% make
==== Building guetzli (release) ====
Creating bin/Release
Creating obj/Release
(omit...)
butteraugli.cc
Linking guetzli
ld: warning: option -s is obsolete and being ignored
% ls -l bin/Release/guetzli
-rwxr-xr-x  1 yoya  staff  280856  3 17 17:34 bin/Release/guetzli
% 
```

# Experiment

I measured Guesszli with 1406 2D-illustration images of various sizes and measured it. Several sheets seem to be caught in the restriction matter, and 1360 sheets could actually be processed.

## Execution

```
% ls illust | wc
   1406    1406   26445
% mkdir illust-out
% cd illust
% (for i in *.jpg ; do o="../illust-out/$i" ;
     identify "$i" ; time guetzli "$i" "$o" ; identify "$o" ;
   done >& ../log-illust.txt )
% ls -l ../tmp | wc
   1360   12233   86837
```

- Log data (a part)

```
3b689cd9.jpg JPEG 500x375 500x375+0+0 8-bit sRGB 59.4KB 0.000u 0:00.000

real	0m7.194s
user	0m6.976s
sys	0m0.212s
../tmp/3b689cd9.jpg JPEG 500x375 500x375+0+0 8-bit sRGB 56KB 0.000u 0:00.000
```

## Summarize script

{{< highlight php >}}
<?php

function filesizeUnit($filesize, $unit) { // to KB
    if ($unit === "KB") {
        ;
    } else if ($unit === "MB") {
        $filesize *= 1024;
    } else if ($unit === "GB") {
        $filesize *= 1024 * 1024;
    } else {
        echo "ERROR: $filesize, $unit\n"; exit(1);
    }
    return $filesize;
}

foreach (file($argv[1]) as $line) {
    if (preg_match("/^([^\/]+.jpg) JPEG (\d+)x(\d+) \S+ \S+ \S+ ([0-9\.]+)(.B)/", $line, $matches)) {
        list($all, $file, $width, $height, $filesize, $unit) = $matches;
        $nPixel = $width * $height;
        $size = (int) sqrt($nPixel);
    $filesize = filesizeUnit($filesize, $unit);
} else if (preg_match("/^user\s+(\d+)m([\d\.]+)s/", $line, $matches)) {
        list($all, $minutes, $seconds) = $matches;
        $t = 60 * $minutes + $seconds;
        if ($t === 0.01) {
            // echo "ERROR: $size $t\n";
        } else {
            //  echo "$size,$t\n";
        }
    } else if (preg_match("/^\.\.\/tmp\/([^\/]+.jpg) JPEG (\d+)x(\d+) \S+ \S+ \S+ ([0-9\.]+)(.B)/", $line, $matches)) {
        list($all, $file, $width, $height, $filesize2, $unit) = $matches;
        $filesize2 = filesizeUnit($filesize2, $unit);
        echo "$filesize,$filesize2\n";
          if ($filesize < $filesize2) {
               exit(1);
        }
    }
}
{{< /highlight >}}

## Graph of summary result

### Processing time

<center> <img src="../time-graph-small.png" /> </center>

- Horizontal is sqrt (width * height). Equivalent to the length of one side assuming a square shape
- Number of seconds in portrait in user time

It is likely that it will be a little less than 100 seconds and 200 seconds at a side 2000 px.

By the way, I am experimenting with a high-performance game PC.

### File size reduction

The horizontal axis is the original size, and the vertical axis is the size after compression. Both are in KB units.

It is a reduction rate at an unusual level higher than expected. It may even be less than half.

<center> <img src="../filesize-graph-small.png" /> </center>
(Places where pink lines do not change in size.Yellow is a place where size is halved)

Even if I visually checked the image with a large reduction rate, I did not know the difference at first glance. great. .

# Impression

In the illustration image, when considering the line (frequency high) and the gradation (frequency low) are the lives, the mid range of the frequency seems to be rough and good, maybe it is easy to cut off other than visual characteristics.

Processing with Guetzli will degrade the data, so it may be visible, for example, when stretching the image or filtering the image. When setting a threshold in the image quality evaluation, it is inevitable that the viewing environment model such as the DPI of the monitor, the viewing distance, and the colorimetric standard to be adopted is on the premise, and it is inevitable that roughness can be seen when the situation is substantially deviated from that .

The comparison with MozJPEG seems to make no sense even if it is summarized because the ring is different in the first place.
