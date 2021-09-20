package controller

import (
	"Laucher/1.0.0/model"
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
  AuthorName string `json:"authorName"`
  AuthorEmail string `json:"authorEmail"`
  SubsCounter int64 `json:"subsCounter"`
  VoteCounter int64 `json:"voteCounter"`
  RatingComposite int8 `json:"ratingComposite"`
	RatingDesign int8 `json:"ratingDesign"`
	RatingUsability int8 `json:"ratingUsability"`
	RatingFunctionality int8 `json:"ratingFunctionality"`
  PageURL string `json:"pageURL"`
  License string `json:"license"`
  Price string `json:"price"`
	Wallet string `json:"wallet"`
}

type ApplicationType struct {
  Id int64 `json:"id"`
  Name string `json:"name"`
  Version string `json:"version"`
  ParentVersion string `json:"parentVersion"`
  ReleaseDate JsonDateType `json:"releaseDate"`
  Picture string `json:"picture"`
  Groups []string `json:"groups"`
  Langs []string `json:"langs"`
  Styles []string `json:"styles"`
  Description string `json:"description"`
  URL string `json:"url"`
  LastUseTime JsonDateType `json:"lastUseTime"`
  // ApplicationDataType `json:""`
}

func (self *ApplicationType) Get() *[]*ApplicationType {
	query := &model.QueryType{
		Table: "applications",
		Fields: "Id, Name, Version, ParentVersion, ReleaseDate, Picture, Groups, Description, Langs, Styles, LastUseTime, URL",
  }
  if self.Id != 0 {
    query.Where = "Id=?"
    query.Values = append(query.Values, self.Id)
  } else if self.Name != "" {
    query.Where = "Name=?"
    query.Values = append(query.Values, self.Name)
    if self.Version != "" {
      query.Where = query.Where + " AND Version=?"
      query.Values = append(query.Values, self.Version)
    }
  }
  rows := query.Get()
  apps := &[]*ApplicationType{}
  for rows.Next(){
    app := &ApplicationType{}
    var (
      dateString string
      lastUseTimeString string
      groups string
      langs string
      styles string
    )
    if err := rows.Scan(&app.Id, &app.Name, &app.Version, &app.ParentVersion, &dateString, &app.Picture,
    &groups, &app.Description, &langs, &styles, &lastUseTimeString, &app.URL); err != nil{
      fmt.Println(err)
      continue
    }
    date, _ := time.Parse(JsonDateFormat, dateString)
    app.ReleaseDate = JsonDateType(date)
    lastUseTime, _ := time.Parse(JsonDateFormat, lastUseTimeString)
    app.LastUseTime = JsonDateType(lastUseTime)
    app.Groups = strings.Split(groups, ",")
    app.Langs = strings.Split(langs, ",")
    app.Styles = strings.Split(styles, ",")
    *apps = append(*apps, app)
  }
	rows.Close()
  return apps
}

func (self *ApplicationType) Add() {
	query := &model.QueryType{
		Table: "applications",
		Fields: "Name, Version, ParentVersion, ReleaseDate, Picture, Groups, Description, Langs, Styles, LastUseTime, URL",
		Values: []interface{}{
			self.Name,
			self.Version,
      self.ParentVersion,
      self.ReleaseDate.Format(),
      self.Picture,
      strings.Join(self.Groups, ","),
      self.Description,
      strings.Join(self.Langs, ","),
      strings.Join(self.Styles, ","),
      self.LastUseTime.Format(),
      self.URL,
    },
  }
  self.Id = query.Add()
}

func (self *ApplicationType) Update() {
	query := &model.QueryType{
		Table: "applications",
		Fields: "Name, Version, ParentVersion, ReleaseDate, Picture, Groups, Description, Langs, Styles, LastUseTime, URL",
		Values: []interface{}{
			self.Name,
			self.Version,
      self.ParentVersion,
      self.ReleaseDate.Format(),
      self.Picture,
      strings.Join(self.Groups, ","),
      self.Description,
      strings.Join(self.Langs, ","),
      strings.Join(self.Styles, ","),
      self.LastUseTime.Format(),
      self.URL,
    },
  }
  query.Update()
}

func (self *ApplicationType) Delete() {
	query := &model.QueryType{
		Table: "applications",
		Values: []interface{}{self.Id},
  }
  query.Delete()
}
