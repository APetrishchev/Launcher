package controller

type ErrorType struct {
	Error string
}
var Error = struct {
	NoError *ErrorType
	InvAPIFuncName *ErrorType
	InvLoginPassword *ErrorType
}{
	NoError: &ErrorType{Error: "NoError"},
	InvAPIFuncName: &ErrorType{Error: "API function name not found"},
  InvLoginPassword: &ErrorType{Error: "Invalid Login or Password"},
}
