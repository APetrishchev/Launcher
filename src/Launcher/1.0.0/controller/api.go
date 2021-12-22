package controller

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/valyala/fasthttp"
)

type APIQueryType map[string]json.RawMessage


func api(ctx *fasthttp.RequestCtx) {
	var result interface{}
	query := APIQueryType{}
	json.Unmarshal(ctx.PostBody(), &query)
	var cmd string
	if err := json.Unmarshal(query["cmd"], &cmd); err != nil {panic(err)}
	if cmd == "authUser" {
		var login, password string
		if err := json.Unmarshal(query["login"], &login); err != nil {panic(err)}
		if err := json.Unmarshal(query["password"], &password); err != nil {panic(err)}
		result = authUser(login, password)
	} else if cmd == "getUser" {
		fields := ""
		if _, ok := query["fields"]; ok {
			if err := json.Unmarshal(query["fields"], &fields); err != nil {panic(err)} }
		result = getUser(ctx.UserValue("UserId").(int64), ctx.UserValue("ProfileId").(int64), fields)
	} else if cmd == "getChronos" {
		profile := &ProfileType{Id: ctx.UserValue("ProfileId").(int64)}
		fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.DataDirPath,
			(*profile.Get())[0].HomeFolder, ".application", "Chronos", "data.json"))
		return
	} else {
		result = Error.InvAPIFuncName
	}
	res, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	ctx.Response.Header.Set("Content-Type", "application/json; charset=utf-8")
	ctx.Write(res)
}

func authUser(login, password string) *ErrorType {
	user := &UserType{Login: login, Passwd: password}
	user.Get()
	if user.Id == 0 {
		return Error.InvLoginPassword
	}
	return Error.NoError
}

type UserProfilesType struct {
	User					*UserType `json:"user"`
	ProfileId			int64 `json:"profile"`
	Profiles			interface{} `json:"profiles"`
	Applications	interface{} `json:"applications"`
	AppGroups			interface{} `json:"appGroups"`
}

func getUser(userId, profileId int64, fields string) *UserProfilesType {
	User := &UserType{Id: userId}
	User.Get()
	userProfiles := &UserProfilesType{User: User, ProfileId: profileId }
	if strings.Contains(fields, "profiles") {
		userProfiles.Profiles = make(map[string]*ProfileType)
		profile := &ProfileType{UserId: userId}
		profiles := profile.Get()
		for _, profile := range *profiles {
			userProfiles.Profiles.(map[string]*ProfileType)[profile.Name] = profile	}
	}
	if strings.Contains(fields, "applications") {
		profile := &ProfileType{Id: profileId}
		data := profile.getApplication()
		userProfiles.AppGroups = data.AppGroups
		userProfiles.Applications = data.Applications
	}
	fmt.Printf("\n%s\nUser: %+v\nProfiles: %+v\n", strings.Repeat("-", 80), userProfiles.User, userProfiles.Profiles)
	return userProfiles
}
