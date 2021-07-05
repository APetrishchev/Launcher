package filesystems

import (
	"fmt"
	"os/exec"
	"strconv"
	"strings"
)

type Partition struct {
	Name  string `json:"name"`
	Total uint64 `json:"total"`
	Used  uint64 `json:"used"`
	Avail uint64 `json:"avail"`
}

func (self *Metrics) getFilesystems() {
	for _, fsName := range config.filesystems.partitions {
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
					if self.Filesystems[idx].Used, err = strconv.ParseUint(fields[2], 10, 64); err != nil {
						fmt.Println(err)
					}
					if self.Filesystems[idx].Avail, err = strconv.ParseUint(fields[3], 10, 64); err != nil {
						fmt.Println(err)
					}
				}
			}
		}
	} else {
		fmt.Println(err)
	}
}
