package main

// http://blog.golang.org/go-image-package
// http://d.hatena.ne.jp/taknb2nch/20131231/1388500659

import (
	"flag"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"os"
)

func main() {
	flag.Parse()
	file_in := flag.Arg(0)
	file_out := flag.Arg(1)
	fd_in, err := os.Open(file_in)
	if err != nil {
		fmt.Fprintln(os.Stderr, "not found:"+file_in)
		os.Exit(1)
	}
	fd_out, err := os.Create(file_out)
	if err != nil {
		fmt.Fprintln(os.Stderr, "not found:"+file_out)
		os.Exit(1)
	}
	image_in, _ := png.Decode(fd_in)
	rect := image_in.Bounds()
	size := rect.Size()

	image_out := image.NewNRGBA(image.Rect(0, 0, 3*size.X, size.Y))

	for y := 0; y < size.Y; y++ {
		for x := 0; x < size.X; x++ {
			var yycolor, cbcolor, crcolor color.Color
			r, g, b, _ := image_in.At(x, y).RGBA()
			yy, cb, cr := color.RGBToYCbCr(uint8(r), uint8(g), uint8(b))
			yycolor = color.YCbCr{uint8(yy), 128, 128}
			cbcolor = color.YCbCr{128, uint8(cb), 128}
			crcolor = color.YCbCr{128, 128, uint8(cr)}
			image_out.Set(x, y, yycolor)
			image_out.Set(size.X+x, y, cbcolor)
			image_out.Set(2*size.X+x, y, crcolor)
		}
	}
	png.Encode(fd_out, image_out)
}
