package agent

import (
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
)

//------------------------------------------------------------------------------
type CPUTicks struct {
	idleTicks, totalTicks uint64
}

var cpusTicks = struct {
	CPUTicks
	CPUs []CPUTicks
}{}

func (self *Metrics) cpuParse(fields *[]string, cpuTicks *CPUTicks, cpuUsage *float64) {
	var idleTicks, totalTicks uint64
	for i := 1; i < len(*fields); i++ {
		val, err := strconv.ParseUint((*fields)[i], 10, 64)
		if err != nil {
			fmt.Println("Error: ", i, (*fields)[i], err)
		}
		totalTicks += val
		if i == 4 {
			idleTicks = val
		}
	}
	deltaIdle := float64(idleTicks - cpuTicks.idleTicks)
	deltaTotal := float64(totalTicks - cpuTicks.totalTicks)
	cpuTicks.idleTicks = idleTicks
	cpuTicks.totalTicks = totalTicks
	*cpuUsage = 100 * (deltaTotal - deltaIdle) / deltaTotal
	return
}

func (self *Metrics) GetCPU() {
	contents, err := ioutil.ReadFile("/proc/stat")
	if err != nil {
		return
	}
	var idx int8 = 0
	for _, line := range strings.Split(string(contents), "\n") {
		if len(line) == 0 {
			continue
		}
		fields := strings.Fields(line)
		if fields[0] == "cpu" {
			self.cpuParse(&fields, &cpusTicks.CPUTicks, &self.CPU.CPU)
		} else if strings.HasPrefix(fields[0], "cpu") {
			if int8(len(cpusTicks.CPUs)) < idx+1 {
				cpusTicks.CPUs = append(cpusTicks.CPUs, CPUTicks{})
			}
			if int8(len(self.CPU.CPUs)) < idx+1 {
				self.CPU.CPUs = append(self.CPU.CPUs, 0)
			}
			self.cpuParse(&fields, &cpusTicks.CPUs[idx], &self.CPU.CPUs[idx])
			idx++
		}
	}
	self.getTopProcess(&self.CPU.Top, "cpu")
	return
}
