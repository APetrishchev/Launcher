package controller

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

type dataType struct {
	applications []*ApplicationType `json:"applications"`
}
var data dataType

func Restore(backupFilePath string) {
  jsonFile, err := os.Open(backupFilePath)
  if err != nil {
    panic(err)
  }
  jsonData, _ := ioutil.ReadAll(jsonFile)
  err = json.Unmarshal(jsonData, &data)
  if err != nil {
    panic(err)
  }
  fmt.Printf(">>>>>  %+v\n", data.applications)
	for _, app := range data.applications {
    fmt.Printf(">>>  %+v\n", app)
		app.Add()
	}

}
