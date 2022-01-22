from lib.aobject import AObject

class Remote(AObject):
  @property
  def errMsg(self):
    msg = [
      f"    Command: {self.command}",
      f"    ErrCode: {self.errCode}",
      "    Result:"
    ]
    for row in self.result:
      msg.append(f"      {row}")
    return '\n'.join(msg)

  def __str__(self):
    return self.errMsg
