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

func RGBToYUV(r, g, b uint8) (uint8, uint8, uint8) {
	r1 := float64(r)
	g1 := float64(g)
	b1 := float64(b)
	y := 0.299*r1 + 0.587*g1 + 0.114*b1
	u := -0.14713*r1 - 0.28886*g1 + 0.436*b1 + 128
	v := 0.615*r1 - 0.51499*g1 - 0.10001*b1 + 128
	return uint8(y), uint8(u), uint8(v)
}

func YUVToRGB(y, u, v uint8) (uint8, uint8, uint8) {
	y1 := float64(y)
	u1 := float64(u)
	v1 := float64(v)
	r := y1 + 1.13983*(v1-128)
	g := y1 - 0.39465*(u1-128) - 0.58060*(v1-128)
	b := y1 + 2.03211*(u1-128)
	return uint8(r), uint8(g), uint8(b)
}

func color_YUV(y, u, v uint8) color.RGBA {
	r, g, b := YUVToRGB(y, u, v)
	return color.RGBA{uint8(r), uint8(g), uint8(b), 255}
}

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
			var yycolor, uucolor, vvcolor color.Color
			r, g, b, _ := image_in.At(x, y).RGBA()
			yy, uu, vv := RGBToYUV(uint8(r), uint8(g), uint8(b))
			yycolor = color_YUV(uint8(yy), 128, 128)
			uucolor = color_YUV(130, uint8(uu), 110)
			vvcolor = color_YUV(130, 110, uint8(vv))
			image_out.Set(x, y, yycolor)
			image_out.Set(size.X+x, y, uucolor)
			image_out.Set(2*size.X+x, y, vvcolor)
		}
	}
	png.Encode(fd_out, image_out)
}
