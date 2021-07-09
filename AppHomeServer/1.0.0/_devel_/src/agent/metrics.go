package agent

//==============================================================================
type Metrics struct {
	Hostname string  `json:"hostname"`
	Uptime   float64 `json:"uptime"`
	CPU      struct {
		CPU  float64    `json:"cpu"`
		CPUs []float64  `json:"cpus"`
		Top  [5]Process `json:"top"`
	} `json:"cpu"`
	Memory struct {
		Total uint64     `json:"total"`
		Avail uint64     `json:"avail"`
		Top   [5]Process `json:"top"`
	} `json:"memory"`
	Swap struct {
		Total uint64 `json:"total"`
		Free  uint64 `json:"free"`
	} `json:"swap"`
	Filesystems []Partition `json:"filesystems"`
	Networks    []Interface `json:"networks"`
}

type Process struct {
	Pid  string `json:"pid"`
	Cmd  string `json:"cmd"`
	Perc string `json:"perc"`
}

type Partition struct {
	Name  string `json:"name"`
	Total uint64 `json:"total"`
	Used  uint64 `json:"used"`
	Avail uint64 `json:"avail"`
}

type Interface struct {
	Name  string  `json:"name"`
	IP    string  `json:"ip"`
	ExtIP string  `json:"extIP"`
	Up    float64 `json:"up"`
	Down  float64 `json:"down"`
}
