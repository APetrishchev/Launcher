package main

import (
	"flag"
	"fmt"
	"os"

	"server"
)

func main() {
	var verFlag = flag.Bool("V", false, "display version of application")
	flag.Parse()
	if *verFlag {
		fmt.Println("v1.0")
		os.Exit(0)
	}
	server.Start(os.Args)
}
