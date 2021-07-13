package model

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

func (self *DBType) Restore(backupFilePath string) {
  jsonFile, err := os.Open(backupFilePath)
  jsonData, _ := ioutil.ReadAll(jsonFile)
  var data map[string]string
  err = json.Unmarshal(jsonData, &data)
  if err != nil {
    panic(err)
  }
	fmt.Println(data)
}
