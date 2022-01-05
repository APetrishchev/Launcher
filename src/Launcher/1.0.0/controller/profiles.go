package controller

import (
	"Launcher/1.0.0/model"
	"strings"
)

type ProfileApplicationType struct {
	Id          int64             `json:"id"`
	Name        string            `json:"name"`
	Groups      []string          `json:"groups"`
	Lang        string            `json:"lang"`
	Langs       []string          `json:"langs"`
	Style       string            `json:"style"`
	Styles      []string          `json:"styles"`
	Picture     string            `json:"picture"`
	Description string            `json:"desription"`
	URL         string            `json:"url"`
	Windows     map[string]string `json:"windows"`
	BackendURLs []string          `json:"backendURLs"`
}

type ProfileApplicationsType struct {
	AppGroups           map[string]*AppGroupsType `json:"appGroups"`
	Applications        map[string]interface{}    `json:"applications"`
	RunningApplications []string                  `json:"runningApplications"`
}

type ProfileType struct {
	Id                    int64    `json:"id"`
	UserId                int64    `json:"userId"`
	OwnerId               int64    `json:"ownerId"`
	Name                  string   `json:"name"`
	FirstName             string   `json:"firstName"`
	LastName              string   `json:"lastName"`
	ShortDescr            string   `json:"shortDescr"`
	Description           string   `json:"description"`
	Gender                string   `json:"gender"`
	Birthday              string   `json:"birthday"`
	Picture               string   `json:"picture"`
	HomeFolder            string   `json:"homeFolder"`
	DocumentsFolder       string   `json:"documentsFolder"`
	PicturesFolder        string   `json:"picturesFolder"`
	AudioFolder           string   `json:"audioFolder"`
	VideoFolder           string   `json:"videoFolder"`
	Countries             []string `json:"countries"`
	Langs                 []string `json:"langs"`
	PreferredApplications []string `json:"preferredApplications"`
}

func (self *ProfileType) Get() *[]*ProfileType {
	query := &model.QueryType{
		Table: "profiles AS p, users AS u",
		Fields: "p.Id, p.UserId, p.OwnerId, p.Name, p.FirstName, p.LastName, p.ShortDescr, p.Description, " +
			"p.Gender, p.Birthday, p.Picture, p.HomeFolder, p.PreferredApplications, u.Countries, u.Langs",
	}
	if self.Id != 0 {
		query.Where = "p.Id=? AND UserId=u.Id"
		query.Values = append(query.Values, self.Id)
	} else if self.UserId != 0 {
		query.Where = "UserId=?"
		query.Values = append(query.Values, self.UserId)
	} else if self.Name != "" {
		query.Where = "p.Name=?"
		query.Values = append(query.Values, self.Name)
	} else {
		query.Where = "p.Name='Anonimous'"
	}
	rows := query.Get()
	profiles := &[]*ProfileType{}
	var (
		preferredApplications string
		countries             string
		langs                 string
	)
	for rows.Next() {
		profile := &ProfileType{}
		err := rows.Scan(&profile.Id, &profile.UserId, &profile.OwnerId, &profile.Name, &profile.FirstName,
			&profile.LastName, &profile.ShortDescr, &profile.Description, &profile.Gender, &profile.Birthday,
			&profile.Picture, &profile.HomeFolder, &preferredApplications, &countries, &langs)
		if err != nil {
			panic(err)
		}
		profile.PreferredApplications = strings.Split(preferredApplications, ",")
		profile.Countries = strings.Split(countries, ",")
		profile.Langs = strings.Split(langs, ",")
		*profiles = append(*profiles, profile)
	}
	rows.Close()
	return profiles
}

func (self *ProfileType) Add() {
	query := &model.QueryType{
		Table: "profiles",
		Fields: "UserId, OwnerId, Name, FirstName, LastName, ShortDescr, Description, " +
			"Birthday, Picture, HomeFolder, PreferredApplications",
		Values: []interface{}{
			self.UserId,
			self.OwnerId,
			self.Name,
			self.FirstName,
			self.LastName,
			self.ShortDescr,
			self.Description,
			self.Birthday,
			self.Picture,
			self.HomeFolder,
			strings.Join(self.PreferredApplications, ","),
		},
	}
	if self.Gender != "" {
		query.Fields += ", Gender"
		query.Values = append(query.Values, self.Gender)
	}
	self.Id = query.Add()
}

func (self *ProfileType) Update() {
	query := &model.QueryType{
		Table: "profiles",
		Fields: "UserId, OwnerId, Name, FirstName, LastName, ShortDescr, Description, " +
			"Gender, Birthday, Picture, HomeFolder, PreferredApplications",
		Values: []interface{}{
			self.UserId,
			self.OwnerId,
			self.Name,
			self.FirstName,
			self.LastName,
			self.ShortDescr,
			self.Description,
			self.Gender,
			self.Birthday,
			self.Picture,
			self.HomeFolder,
			strings.Join(self.PreferredApplications, ","),
		},
	}
	query.Update()
}

func (self *ProfileType) Delete() {
	query := &model.QueryType{
		Table:  "profiles",
		Values: []interface{}{self.Id},
	}
	query.Delete()
}

func (self *ProfileType) getApplication() *ProfileApplicationsType {
	query := &model.QueryType{
		Table: "profile_application AS pa, applications AS a",
		Fields: "pa.ApplicationId, CASE WHEN pa.ApplicationName LIKE '' THEN a.Name ELSE pa.ApplicationName END AS Name," +
			"CASE WHEN pa.ApplicationGroups LIKE '' THEN a.Groups ELSE pa.ApplicationGroups END AS Groups," +
			"pa.Lang, a.Langs, pa.Style, a.Picture, a.Description, a.URL, pa.BackendURLs",
		Where:  "ProfileId=? AND ApplicationId=a.Id",
		Values: []interface{}{self.Id},
	}
	rows := query.Get()
	var (
		groups   string
		langs    string
		backends string
	)
	data := &ProfileApplicationsType{Applications: make(map[string]interface{})}
	for rows.Next() {
		app := ProfileApplicationType{}
		if err := rows.Scan(&app.Id, &app.Name, &groups, &app.Lang, &langs, &app.Style,
			&app.Picture, &app.Description, &app.URL, &backends); err != nil {
			panic(err)
		}
		app.Groups = strings.Split(groups, ",")
		app.Langs = strings.Split(langs, ",")
		app.BackendURLs = strings.Split(backends, ",")
		if app.Lang == "" {
		out:
			for _, lang := range self.Langs {
				for _, appLang := range app.Langs {
					if lang == appLang {
						app.Lang = lang
						break out
					}
				}
			}
		}
		// Windows
		win := WindowType{ProfileId: self.Id, ApplicationId: app.Id}
		app.Windows = win.Get()
		data.Applications[app.Name] = app
	}
	// AppGroups
	grp := &AppGroupsType{}
	data.AppGroups = grp.Get()
	// RunningApplications
	data.RunningApplications = make([]string, 1)
	data.RunningApplications[0] = "Chronos"
	return data
}
