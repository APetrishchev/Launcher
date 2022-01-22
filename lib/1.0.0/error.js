export class Error {
	static NoError = {code: 0, msg: "No Error"}
	static ErrAuth = {code: 1, msg: "Incorect Username or Password"}
	static NotAuth = {code: 3, msg: "Session is not authorized"}
}
