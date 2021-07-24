#*******************************************************************************
#*******************************************************************************
#*******************************************************************************
class Minify():
  STRING_LITERAL = 1
  HEX_NUM_LITERAL = 2
  DEC_NUM_LITERAL = 3
  OCT_NUM_LITERAL = 4
  BIN_NUM_LITERAL = 5
  RESERVED_WORD = 6
  SINGLE_LINE_COMMENT = 7
  MULTY_LINE_COMMENT = 8
  COLOR_NAME = 9
  IF_STATEMENT = 10
  THEN_STATEMENT = 11
  ELSE_STATEMENT = 12
  FOR_STATEMENT = 13
  WHILE_STATEMENT = 14
  SWITCH_STATEMENT = 15
  CONDITIONAL_STATEMENT = 16
  CODE_BLOCK = 17
  DEBUG_INFO = 100

  lexemeTypes = {
    STRING_LITERAL: 'String Literal',
    DEC_NUM_LITERAL: 'Dec Num Literal',
    HEX_NUM_LITERAL: 'Hex Num Literal',
    OCT_NUM_LITERAL: 'Oct Num Literal',
    BIN_NUM_LITERAL: 'Bin Num Literal',
    RESERVED_WORD: 'Reserved Word',
    SINGLE_LINE_COMMENT: 'Single Line Comment',
    MULTY_LINE_COMMENT: 'Multy Line Comment',
    COLOR_NAME: 'Color Name',
    IF_STATEMENT: 'if Statement',
    THEN_STATEMENT: 'then Statement',
    ELSE_STATEMENT: 'else Statement',
    FOR_STATEMENT: 'for Statement',
    WHILE_STATEMENT: 'while Statement',
    SWITCH_STATEMENT: 'switch Statement',
    CONDITIONAL_STATEMENT: 'Conditional Statement',
    CODE_BLOCK: 'Code Block',
    DEBUG_INFO: 'Debug Info'
  }

  reservedWords = (
    'abstract', 'arguments', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
    'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double',
    'else', 'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally',
    'float', 'for', 'function', 'goto', 'if', 'implements', 'import', 'in',
    'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null',
    'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'super',
    'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try',
    'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield'
  )

  #Multiplicative Operators
  #Additive Operators
  #Bitwise Shift Operators
  #Relational Operators
  #Equality Operators
  #Binary Bitwise Operators
  #Binary Logical Operators
  oprerators = (
    '+', '-', '*', '/', '%', '++', '--', '&', '|', '^', '~', '<<', '>>' '>>>',
    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=', '&=', '^=', '|=',
    '==', '===', '!=', '!==', '>', '>=', '<', '<=',
    '!', '&&', '||',
  )

  punctuators = ('.', ',', ';', ':', '?', '~', '(', ')', '[', ']', '{', '}')

  COLOR_NAMES = {
    'azure': (240,255,255),
    'beige': (245,245,220),
    'bisque': (255,228,196),
    'blanchedalmond': (255,235,205),
    'brown': (165,42,42),
    'burlywood': (222,184,135),
    'chartreuse': (127,255,0),
    'chocolate': (210,105,30),
    'coral': (255,127,80),
    'cornsilk': (255,248,220),
    'crimson': (220,20,60),
    'cyan': (0,255,255),
    'darkcyan': (0,139,139),
    'darkgoldenrod': (184,134,11),
    'darkgray': (169,169,169),
    'darkgreen': (0,100,0),
    'darkgrey': (169,169,169),
    'darkkhaki': (189,183,107),
    'darkmagenta': (139,0,139),
    'darkolivegreen': (85,107,47),
    'darkorange': (255,140,0),
    'darkorchid': (153,50,204),
    'darkred': (139,0,0),
    'darksalmon': (233,150,122),
    'darkseagreen': (143,188,143),
    'darkslategray': (47,79,79),
    'darkslategrey': (47,79,79),
    'darkturquoise': (0,206,209),
    'darkviolet': (148,0,211),
    'deeppink': (255,20,147),
    'dimgray': (105,105,105),
    'dimgrey': (105,105,105),
    'firebrick': (178,34,34),
    'forestgreen': (34,139,34),
    'gainsboro': (220,220,220),
    'gold': (255,215,0),
    'goldenrod': (218,165,32),
    'gray': (128,128,128),
    'green': (0,128,0),
    'grey': (128,128,128),
    'honeydew': (240,255,240),
    'hotpink': (255,105,180),
    'indianred': (205,92,92),
    'indigo': (75,0,130),
    'ivory': (255,255,240),
    'khaki': (240,230,140),
    'lavender': (230,230,250),
    'lavenderblush': (255,240,245),
    'lawngreen': (124,252,0),
    'lemonchiffon': (255,250,205),
    'lightcoral': (240,128,128),
    'lightcyan': (224,255,255),
    'lightgray': (211,211,211),
    'lightgreen': (144,238,144),
    'lightgrey': (211,211,211),
    'lightpink': (255,182,193),
    'lightsalmon': (255,160,122),
    'lightseagreen': (32,178,170),
    'lightslategray': (119,136,153),
    'lightslategrey': (119,136,153),
    'lime': (0,255,0),
    'limegreen': (50,205,50),
    'linen': (250,240,230),
    'magenta': (255,0,255),
    'maroon': (128,0,0),
    'mediumorchid': (186,85,211),
    'mediumpurple': (147,112,219),
    'mediumseagreen': (60,179,113),
    'mediumspringgreen': (0,250,154),
    'mediumturquoise': (72,209,204),
    'mediumvioletred': (199,21,133),
    'mintcream': (245,255,250),
    'mistyrose': (255,228,225),
    'moccasin': (255,228,181),
    'navy': (0,0,128),
    'oldlace': (253,245,230),
    'olive': (128,128,0),
    'olivedrab': (107,142,35),
    'orange': (255,165,0),
    'orangered': (255,69,0),
    'orchid': (218,112,214),
    'palegoldenrod': (238,232,170),
    'palegreen': (152,251,152),
    'paleturquoise': (175,238,238),
    'palevioletred': (219,112,147),
    'papayawhip': (255,239,213),
    'peachpuff': (255,218,185),
    'peru': (205,133,63),
    'pink': (255,192,203),
    'plum': (221,160,221),
    'purple': (128,0,128),
    'rosybrown': (188,143,143),
    'saddlebrown': (139,69,19),
    'salmon': (250,128,114),
    'sandybrown': (244,164,96),
    'seagreen': (46,139,87),
    'seashell': (255,245,238),
    'sienna': (160,82,45),
    'silver': (192,192,192),
    'slategray': (112,128,144),
    'slategrey': (112,128,144),
    'snow': (255,250,250),
    'springgreen': (0,255,127),
    'teal': (0,128,128),
    'thistle': (216,191,216),
    'tomato': (255,99,71),
    'turquoise': (64,224,208),
    'violet': (238,130,238),
    'wheat': (245,222,179)
  }

#*******************************************************************************
  def __init__(self, inBuf):
    self.inBuf = inBuf
    self.inBufLen = len(inBuf) - 1
    self.inBufIdx = -1
    self.__out = []
    self.labels = []

#*******************************************************************************
  def jsMinify(self):
    #jsMin = []
    #for ln in jsTxt.splitlines():
    #  ln = ln.strip()
    #  if ln.startswith('//') and not ln.endswith('*/'):
    #    continue
    #  if ln == '':
    #    continue
    #  jsMin.append(ln)
    #jsTxt = '\n'.join(jsMin)
    #if ord(self.char()) == 13 and ord(self.char()) == 10):
    #Numeric literal must start with a decimal digit or a decimal point

    while self.inBufIdx < self.inBufLen:
      self.inBufIdx += 1
      self.chkComment()
      self.chkReservedWord()
      #self.chkOperator()
      #self.chkLiteral()
      #self.chkColorName()
    self.outBuf = "\n/*\n"
    self.assembly(self.__out)
    self.outBuf += "*/\n"
    self.outBuf += self.inBuf
    return self.outBuf

#*******************************************************************************
  def assembly(self, items):
    for item in items:
      if type(item[1]) == list:
        self.outBuf += '%s:\n  ' % self.lexemeTypes[item[0]]
        self.assembly(item[1])
        self.outBuf += '\n'
      else:
        self.outBuf += '%s: <%s>\n' % (self.lexemeTypes[item[0]], item[1])

#*******************************************************************************
  def prevChar(self):
    return self.inBuf[self.inBufIdx-1]

#*******************************************************************************
  def char(self, offset=0):
    return self.inBuf[self.inBufIdx+offset]

#*******************************************************************************
  def nextChar(self):
    return self.inBuf[self.inBufIdx+1]

#*******************************************************************************
  def out(self, key, val):
    self.__out.append([key, val])

#*******************************************************************************
  def skipWhite(self):
    while self.inBufIdx < self.inBufLen and ( \
      self.char() == ' ' \
      or self.char() == '\t' \
      or self.char() == '\n' \
    ):
      self.inBufIdx += 1

#*******************************************************************************
  def chkLiteral(self):
    self.chkString()
    self.chkNumber()

#*******************************************************************************
  def chkString(self):
    if self.char() == "'" or self.char() == '"':
      ch = self.char()
      val = ''
      for i in xrange(self.inBufIdx+1, self.inBufLen):
        if not ( not self.inBuf[i-1] == '\\' and self.inBuf[i] == ch):
          val += self.inBuf[i]
        else:
          self.out(self.STRING_LITERAL, val)
          self.inBufIdx = i + 1
          return True
      else:
        pass
        #rise error
    return False

#*******************************************************************************
  def chkNumber(self):
    pass
    #BIN_NUM_LITERAL 0b or 0B
    #HEX_NUM_LITERAL 0x or 0X
    #OCT_NUM_LITERAL 0o or 0O

#*******************************************************************************
  def chkComment(self):
    if self.char() == '/' and self.inBufIdx+1 < self.inBufLen:
      if self.nextChar() == '/':
        val = ''
        for i in xrange(self.inBufIdx+2, self.inBufLen):
          if not self.inBuf[i] == '\n':
            val += self.inBuf[i]
          else:
            self.out(self.SINGLE_LINE_COMMENT, val)
            self.inBufIdx = i
            return True
      elif self.nextChar() == '*':
        val = ''
        for i in xrange(self.inBufIdx+2, self.inBufLen):
          if not (self.inBuf[i] == '*' and self.inBufLen > i+1 and self.inBuf[i+1] == '/'):
            val += self.inBuf[i]
          else:
            self.out(self.MULTY_LINE_COMMENT, val)
            self.inBufIdx = i + 2
            return True
        else:
          pass
          #rise error
    return False

#*******************************************************************************
  def getLexeme(self):
    lexeme = ''
    for i in xrange(self.inBufIdx, self.inBufLen):
      if self.inBuf[i] in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$':
        lexeme += self.inBuf[i]
      else:
        break
    return lexeme

#*******************************************************************************
  def getStatement(self):
    statement = ''
    self.skipWhite()
    for i in xrange(self.inBufIdx, self.inBufLen):
      if not (self.inBuf[i] == ';' or self.inBuf[i] == '\n'):
        statement += self.inBuf[i]
      else:
        break
    return statement

#*******************************************************************************
  def chkReservedWord(self):
    lexeme = self.getLexeme()
    if lexeme in self.reservedWords:
      if lexeme == 'if':
        self.inBufIdx += 2
        self.chkIfStatement()
      #elif lexeme == 'for':
      #  self.inBufIdx += 3
      #  self.chkForStatement()
      #elif lexeme == 'while':
      #  self.inBufIdx += 5
      #  self.chkWhileStatement()
      #elif lexeme == 'switch':
      #  self.inBufIdx += 6
      #  self.chkSwitchStatement()
      else:
        self.out(self.RESERVED_WORD, lexeme)
        self.inBufIdx += len(lexeme)
      return True
    return False

#*******************************************************************************
  def chkIfStatement(self):
    ifStatement = []
    conditionalStatement = self.chkConditionalStatement()
    if conditionalStatement:
      ifStatement.append(conditionalStatement)
    else:
      pass
      #rise error expected Conditional Statement
    codeBlock = self.chkCodeBlock()
    if codeBlock:
      ifStatement.append([self.THEN_STATEMENT, codeBlock])
    else:
      statement = self.getStatement()
      self.inBufIdx += len(statement)
      ifStatement.append([self.THEN_STATEMENT, statement])

    self.skipWhite()
    lexeme = self.getLexeme()
    if lexeme == 'else':
      self.inBufIdx += 4
      codeBlock = self.chkCodeBlock()
      if codeBlock:
        ifStatement.append([self.ELSE_STATEMENT, codeBlock])
      else:
        statement = self.getStatement()
        self.inBufIdx += len(statement)
        ifStatement.append([self.ELSE_STATEMENT, statement])
    self.out(self.IF_STATEMENT, ifStatement)

#*******************************************************************************
  def chkForStatement(self):
    self.out(self.FOR_STATEMENT, '')
    if not self.chkConditionalStatement():
      pass
      #rise error expected Conditional Statement
    if not self.chkCodeBlock():
      statement = self.getStatement()
      self.out(self.FOR_STATEMENT, statement)

#*******************************************************************************
  def chkWhileStatement(self):
    self.out(self.WHILE_STATEMENT, '')

#*******************************************************************************
  def chkSwitchStatement(self):
    self.out(self.SWITCH_STATEMENT, '')

#*******************************************************************************
  def chkConditionalStatement(self):
    temp = ''
    skobka = 0
    self.skipWhite()
    if self.char() == '(':
      self.inBufIdx += 1
      self.skipWhite()
      for i in xrange(self.inBufIdx, self.inBufLen):
        if not self.inBuf[i] == ')':
          temp += self.inBuf[i]
          if self.inBuf[i] == '(':
            skobka += 1
        else:
          if skobka > 0:
            temp += self.inBuf[i]
            skobka -= 1
          else:
            self.inBufIdx = i + 1
            return [self.CONDITIONAL_STATEMENT, temp]
      else:
        pass
        #rise error expected ')'
    return False

#*******************************************************************************
  def chkCodeBlock(self):
    codeBlock = ''
    self.skipWhite()
    if self.char() == '{':
      self.inBufIdx += 1
      self.skipWhite()
      for i in xrange(self.inBufIdx, self.inBufLen):
        if not self.inBuf[i] == '}':
          #self.chkCodeBlock()
          codeBlock += self.inBuf[i]
        else:
          self.inBufIdx = i + 1
          return [[self.CODE_BLOCK, codeBlock]]
      else:
        pass
        #rise error expected '}'
    return False

#*******************************************************************************
    #def chkStatement(self):
    #def chkDownWhileStatement(self):
    #def chkBreakStatement(self):
    #def chkContinueStatement(self):
    #def chkReturnStatement(self):
    #def chkWithStatement(self):
    #def chkSwitchCase(self):
    #def chkThrouStatement(self):
    #def chkCathClause(self):
    #def chkTryStatement(self):
    #def chkDebugerStatement(self):

#*******************************************************************************
  def chkColorName(self):
    pass

