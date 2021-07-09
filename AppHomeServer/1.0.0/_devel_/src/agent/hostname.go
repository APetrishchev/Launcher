package agent

import (
	"fmt"
	"os"
)

//------------------------------------------------------------------------------
func (self *Metrics) GetHostname() {
	var err error
	if self.Hostname, err = os.Hostname(); err != nil {
		fmt.Println("Error: ", err)
	}
}
