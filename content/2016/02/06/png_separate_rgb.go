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
			r, g, b, a := image_in.At(x, y).RGBA()
			image_out.Set(x, y, color.RGBA{uint8(r), 0, 0, uint8(a)})
			image_out.Set(size.X+x, y, color.RGBA{0, uint8(g), 0, uint8(a)})
			image_out.Set(2*size.X+x, y, color.RGBA{0, 0, uint8(b), uint8(a)})
		}
	}
	png.Encode(fd_out, image_out)
}
