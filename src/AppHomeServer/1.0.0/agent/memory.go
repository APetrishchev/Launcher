package agent

import (
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
)

//------------------------------------------------------------------------------
func (self *Metrics) GetMemory() {
	if contents, err := ioutil.ReadFile("/proc/meminfo"); err == nil {
		for _, line := range strings.Split(string(contents), "\n") {
			fields := strings.Fields(line)
			if len(line) == 0 {
				continue
			}
			if fields[0] == "MemTotal:" {
				if self.Memory.Total, err = strconv.ParseUint((fields)[1], 10, 64); err != nil {
					fmt.Println("Error: ", err)
				}
				self.Memory.Total = self.Memory.Total * 1024
			} else if fields[0] == "MemAvailable:" {
				if self.Memory.Avail, err = strconv.ParseUint((fields)[1], 10, 64); err != nil {
					fmt.Println("Error: ", err)
				}
				self.Memory.Avail = self.Memory.Avail * 1024
			} else if fields[0] == "SwapTotal:" {
				if self.Swap.Total, err = strconv.ParseUint((fields)[1], 10, 64); err != nil {
					fmt.Println("Error: ", err)
				}
				self.Swap.Total = self.Swap.Total * 1024
			} else if fields[0] == "SwapFree:" {
				if self.Swap.Free, err = strconv.ParseUint((fields)[1], 10, 64); err != nil {
					fmt.Println("Error: ", err)
				}
				self.Swap.Free = self.Swap.Free * 1024
			}
		}
	}
	self.getTopProcess(&self.Memory.Top, "mem")
	return
}
