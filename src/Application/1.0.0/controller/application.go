package controller

import (
	"Application/1.0.0/model"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

//==============================================================================
type JsonDateType time.Time
var JsonDateFormat = "2006-01-02"

func (self JsonDateType) UnmarshalJSON(byte_ []byte) error {
  str := strings.Trim(string(byte_), "\"")
  date, err := time.Parse(JsonDateFormat, str)
  if err != nil {
      return err
  }
  self = JsonDateType(date)
  return nil
}

func (self JsonDateType) MarshalJSON() ([]byte, error) {
  return json.Marshal(self)
}

func (self JsonDateType) Format() string {
  date := time.Time(self)
  return date.Format(JsonDateFormat)
}

//==============================================================================
type ApplicationDataType struct {
  AuthorName string
  AuthorEmail string
  SubsCounter int64
  VoteCounter int64
  RatingComposite int8
	RatingDesign int8
	RatingUsability int8
	RatingFunctionality int8
  PageURL string
  License string
  Price string
	Wallet string
}

type ApplicationType struct {
  Id int64
  Name string
  Version string
  ParentVersion string
  ReleaseDate JsonDateType
  Picture string
  Groups []string
  Langs []string
  Description string
  Path string
  LastUseTime JsonDateType
  // ApplicationDataType
}

func (self *ApplicationType) Get() (*[]*ApplicationType, error) {
  var (
    select_ string
    where string
    values []interface{}
  )
  select_ = "Id,Name,Version,ParentVersion,ReleaseDate,Picture,Groups,Description,Langs,LastUseTime,Path"
  if self.Id != 0 {
    where = "Id=?"
    values = append(values[:], self.Id)
  } else if self.Name != "" {
    where = "Name=?"
    values = append(values, self.Name)
    if self.Version != "" {
      where = where + " AND Version=?"
      values = append(values, self.Version)
    }
  }
  rows, err := model.DbInstance.Get_("applications", select_, where, &values)
  if err != nil {}
  apps := &[]*ApplicationType{}
  for rows.Next(){
    app := &ApplicationType{}
    var (
      dateString string
      lastUseTimeString string
      groups string
      langs string
    )
    if err := rows.Scan(&app.Id, &app.Name, &app.Version, &app.ParentVersion, &dateString, &app.Picture,
    &groups, &app.Description, &langs, &lastUseTimeString, &app.Path); err != nil{
      fmt.Println(err)
      continue
    }
    date, _ := time.Parse(JsonDateFormat, dateString)
    app.ReleaseDate = JsonDateType(date)
    lastUseTime, _ := time.Parse(JsonDateFormat, lastUseTimeString)
    app.LastUseTime = JsonDateType(lastUseTime)
    app.Groups = strings.Split(groups, ",")
    app.Langs = strings.Split(langs, ",")
    *apps = append(*apps, app)
  }
  return apps, err
}

func (self *ApplicationType) Add() (err error) {
	fields := &map[string]interface{} {
    "Name": self.Name,
    "Version": self.Version,
    "ParentVersion": self.ParentVersion,
    "ReleaseDate": self.ReleaseDate.Format(),
    "Picture": self.Picture,
    "Groups": strings.Join(self.Groups, ","),
    "Description": self.Description,
    "Langs": strings.Join(self.Langs, ","),
    "LastUseTime": self.LastUseTime.Format(),
    "Path": self.Path,
	}
	self.Id, err = model.DbInstance.Add_("applications", fields)
  return err
}

func (self *ApplicationType) Upd() error {
	fields := &map[string]interface{} {
    "Name": self.Name,
    "Version": self.Version,
    "ParentVersion": self.ParentVersion,
    "ReleaseDate": self.ReleaseDate.Format(),
    "Picture": self.Picture,
    "Groups": strings.Join(self.Groups, ","),
    "Description": self.Description,
    "Langs": strings.Join(self.Langs, ","),
    "LastUseTime": self.LastUseTime.Format(),
    "Path": self.Path,
	}
	return model.DbInstance.Upd_("applications", self.Id, fields)
}

func (self *ApplicationType) Del() error {
	return model.DbInstance.Del_("applications", []interface{}{self.Id})
}
