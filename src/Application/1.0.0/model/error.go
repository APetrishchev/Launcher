package model

import "fmt"

func CheckError(err error) string {
  if err != nil {
    panic(err)
    return fmt.Sprintf("FAIL\n  Error: %s", err)
  }
  return "OK"
}
