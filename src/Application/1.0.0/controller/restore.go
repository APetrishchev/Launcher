package controller

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"time"
)

type manifestApplicationType struct {
  Name string
  Version string
  ParentVersion string
  ReleaseDate string
  Picture string
  Groups []string
  Langs []string
  Description string
  AuthorName string
  AuthorEmail string
  PageURL string
  License string
  Price string
	Wallet string
}

func Restore(backupFilePath string) {
  var temp = struct {
    applications map[string]map[string]int64
  }{
    applications: make(map[string]map[string]int64),
  }

  appDirsPath, err := filepath.Glob("/home/apetrishchev/Portable/Projects/github.com/APetrishchev/Laucher/App*")
  if err != nil {
    log.Fatal(err)
  }
  for _, appDirPath := range appDirsPath {
    appVerDirsPath, err := filepath.Glob(filepath.Join(appDirPath, "*"))
    if err != nil {
      log.Fatal(err)
    }
    for _, appVerDirPath := range appVerDirsPath {
      jsonFile, err := os.Open(filepath.Join(appVerDirPath, "manifest.json"))
      if err != nil {
        continue
      }
      jsonData, _ := ioutil.ReadAll(jsonFile)
      var manifestApp manifestApplicationType
      if err = json.Unmarshal(jsonData, &manifestApp); err != nil {
        fmt.Println(err)
        panic(err)
      }
      date, _ := time.Parse(JsonDateFormat, manifestApp.ReleaseDate)
      app := ApplicationType{
        Name: manifestApp.Name,
        Version: manifestApp.Version,
        ParentVersion: manifestApp.ParentVersion,
        ReleaseDate: JsonDateType(date),
        Picture: manifestApp.Picture,
        Groups: manifestApp.Groups,
        Langs: manifestApp.Langs,
        Description: manifestApp.Description,
      }
      fmt.Printf("Add \"%s %s\" to \"application\" ... OK\n", manifestApp.Name, manifestApp.Version)
      app.Add()
      if _, ok := temp.applications[manifestApp.Name]; !ok {
        temp.applications[manifestApp.Name] = make(map[string]int64)
      }
      temp.applications[manifestApp.Name][manifestApp.Version] = app.Id
    }
  }

}
