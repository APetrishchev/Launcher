package main

import (
	"Application/1.0.0/httpServer_"
	"flag"
	"fmt"
	"os"
)

func main() {
	var verFlag = flag.Bool("V", false, "display version")
	// var startFlag = flag.Bool("start", false, "start server")
	// var stopFlag = flag.Bool("stop", false, "stop server")
	flag.Parse()
	if *verFlag {
		fmt.Println("v1.0")
		os.Exit(0)
	}
	// if *startFlag {
		httpServer_.Start(os.Args)
	// }
}
