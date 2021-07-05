package metrics

//------------------------------------------------------------------------------
func (self *metrics.Metrics) getTopProcess(top *[5]metrics.Process, by string) {
	// ps -eo pid,cmd,%%cpu --sort=-%%cpu | head
	fmt.Println(">>> getProcess", by)
	if out, err := exec.Command("ps", "-e", "--format=pid,cmd,%"+by, "--no-headers", "--sort=-%"+by).Output(); err == nil {
		for idx, line := range strings.Split(string(out), "\n") {
			if len(line) == 0 {
				continue
			}
			process := &metrics.Process{}
			process.Pid = strings.Trim(line[:7], " ")
			cmd := strings.Split(strings.Fields(line[8:36])[0], "/")
			process.Cmd = strings.Trim(cmd[len(cmd)-1], " ")
			process.Perc = strings.Trim(line[36:], " ")
			if idx < 5 {
				top[idx] = *process
				if by == "cpu" {
					fmt.Println(idx, "  ", *process)
				} else {
					fmt.Println(idx, "  ", *process)
				}
			}
		}
	} else {
		fmt.Println(err)
	}
}
