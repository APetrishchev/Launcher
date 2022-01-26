package agent

import (
	"fmt"
	"os/exec"
	"strconv"
	"strings"
)

//------------------------------------------------------------------------------
func (self *Metrics) GetFilesystems(partitions []string) {
	for _, fsName := range partitions {
		self.Filesystems = append(self.Filesystems, Partition{Name: fsName})
	}
	if out, err := exec.Command("df", "--block-size=1K", "--output=target,size,used,avail").Output(); err == nil {
		for _, line := range strings.Split(string(out), "\n") {
			fields := strings.Fields(line)
			if len(line) == 0 {
				continue
			}
			for idx, fs := range self.Filesystems {
				if fields[0] == fs.Name {
					if self.Filesystems[idx].Total, err = strconv.ParseUint(fields[1], 10, 64); err != nil {
						fmt.Println(err)
					}
					self.Filesystems[idx].Total = self.Filesystems[idx].Total * 1024
					if self.Filesystems[idx].Used, err = strconv.ParseUint(fields[2], 10, 64); err != nil {
						fmt.Println(err)
					}
					self.Filesystems[idx].Used = self.Filesystems[idx].Used * 1024
					if self.Filesystems[idx].Avail, err = strconv.ParseUint(fields[3], 10, 64); err != nil {
						fmt.Println(err)
					}
					self.Filesystems[idx].Avail = self.Filesystems[idx].Avail * 1024
				}
			}
		}
	} else {
		fmt.Println(err)
	}
}
