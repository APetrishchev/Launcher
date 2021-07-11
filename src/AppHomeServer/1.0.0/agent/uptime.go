package agent

import (
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
)

//------------------------------------------------------------------------------
func (self *Metrics) GetUptime() {
	var err error
	if contents, err := ioutil.ReadFile("/proc/uptime"); err == nil {
		if self.Uptime, err = strconv.ParseFloat(strings.Split(string(contents), " ")[0], 64); err == nil {
			return
		}
	}
	fmt.Println("Error: ", err)
	return
}
