package controller

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
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
  Styles []string
  Description string
  AuthorName string
  AuthorEmail string
  PageURL string
  License string
  Price string
	Wallet string
}

type laucherType struct {
  ApplicationGroups []*struct{
    Name        string
    Description string
    Picture     string
  }
  Users []*struct{
    Login       string
    Passwd 			string
    PublicKey   string
    SecretKey   string
    Countries   string
    Langs       string
  }
  Profiles []*struct{
    User          			   string
    Owner         			   string
    Name            		   string
    FirstName       		   string
    LastName        		   string
    ShortDescr      		   string
    Description     		   string
    Gender          		   string
    Birthday        		   string
    Picture         		   string
    HomeFolder      		   string
    PreferredApplications  string
  }
  Profile_Application []map[string]map[string]map[string]interface{}
}

func Restore(backupFilePath string) {
  var ids = struct {
    applications map[string]map[string]int64
    users map[string]int64
    profiles map[string]int64
  }{
    applications: make(map[string]map[string]int64),
    users: make(map[string]int64),
    profiles: make(map[string]int64),
  }

  fmt.Println("\nApplications")
  appDirsPath, err := filepath.Glob(filepath.Join(Config.RootDirPath, "App*"))
  if err != nil {
    log.Fatal(err)
  }
  for _, appDirPath := range appDirsPath {
    appVerDirsPath, err := filepath.Glob(filepath.Join(appDirPath, "*"))
    if err != nil {
      log.Fatal(err)
    }
    for _, appVerDirPath := range appVerDirsPath {
      if strings.HasSuffix(appVerDirPath, "last") {
        continue
      }
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
        Styles: manifestApp.Styles,
        Description: manifestApp.Description,
        URL: fmt.Sprintf("App%s/%s", manifestApp.Name, manifestApp.Version),
      }
      fmt.Printf("  add \"%s %s\" ... OK\n", manifestApp.Name, manifestApp.Version)
      app.Add()
      if _, ok := ids.applications[manifestApp.Name]; !ok {
        ids.applications[manifestApp.Name] = make(map[string]int64)
      }
      ids.applications[manifestApp.Name][manifestApp.Version] = app.Id
    }
  }

  jsonFile, err := os.Open(backupFilePath)
  if err != nil {panic(err)}
  jsonData, _ := ioutil.ReadAll(jsonFile)
  laucher := laucherType{}
  if err = json.Unmarshal(jsonData, &laucher); err != nil {
    fmt.Println(err)
    panic(err)
  }

  fmt.Println("\nApplicationGroups")
  for _, group := range laucher.ApplicationGroups {
    grp := &AppGroupsType{Name: group.Name, Description: group.Description, Picture: group.Picture}
    grp.Add()
    fmt.Printf("  add \"%s\" ... OK\n", group.Name)
  }

  fmt.Println("\nUsers")
  for _, item := range laucher.Users {
    user := &UserType{Login: item.Login, Passwd: item.Passwd,
      PublicKey: item.PublicKey, SecretKey: item.SecretKey,
      Countries: strings.Split(item.Countries, ","), Langs: strings.Split(item.Langs, ",")}
    user.Add()
    fmt.Printf("  add \"%s\" ... OK\n", user.Login)
    ids.users[user.Login] = user.Id
  }

  fmt.Println("\nProfiles")
  for _, item := range laucher.Profiles {
    profile := &ProfileType{UserId: ids.users[item.User], OwnerId: ids.users[item.User], Name: item.Name,
      FirstName: item.FirstName, LastName: item.LastName, ShortDescr: item.ShortDescr,
      Description: item.Description, Gender: item.Gender, Birthday: item.Birthday,
      Picture: item.Picture, HomeFolder: item.HomeFolder,
      PreferredApplications: strings.Split(item.PreferredApplications, ",")}
    profile.Add()
    fmt.Printf("  add \"%s\" ... OK\n", profile.Name)
    ids.profiles[profile.Name] = profile.Id
  }

  fmt.Println("\nProfile_Application")
  for _, items := range laucher.Profile_Application {
    for profileName, apps := range items {
      for appName, app := range apps {
        profileApplication := &Profile_ApplicationType{ProfileId: ids.profiles[profileName],
          ApplicationId: ids.applications[appName][app["Version"].(string)]}
        profileApplication.Add()
        fmt.Printf("  add \"%s %s\" to \"%s\" ... OK \n", appName, app["Version"], profileName)
        if _, ok := app["Windows"]; ok {
          for name, json := range app["Windows"].(map[string]interface{}) {
            win := WindowType{ProfileId: ids.profiles[profileName],
              ApplicationId: ids.applications[appName][app["Version"].(string)], Name: name, Json: json.(string)}
            win.Add()
          }
        }
      }
    }
  }
}
