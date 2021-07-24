//******************************************************************************
//******************************************************************************
//* Application "Scheduler"
Scheduler = extend(Application, function() {
  this.super.constructor.call(this);
});

//******************************************************************************
Scheduler.prototype.show = function() {
  this.mainWin.addItem(new Clock('schedulerClock'));
  var now = new Date();
  var month = now.getMonth() - 1;
  if(month < 0) {
    month = 11;
    var year = now.getFullYear() - 1;
  };
  this.mainWin.addItem(new Calendar('schedulerCalendarPrevMonth', year, month));
  this.mainWin.addItem(new Calendar('schedulerCalendarMonth', null, now.getMonth()));
  var month = now.getMonth() + 1;
  if(month > 11) {
    month = 0;
    var year = now.getFullYear() + 1;
  };
  this.mainWin.addItem(new Calendar('schedulerCalendarNextMonth', year, month));

  //var table = new Table();
  //table.addColumn({'value': 'Id', 'descr': 'Identificator', 'width': 80, 'align': 'left'});
  //table.addColumn({'value': 'Name', 'descr': 'Name', 'width': 80, 'align': 'left'});
  //table.addRow({'value': '01'}, {'value': '02'});
  //table.addRow({'value': '11'}, {'value': '12'});

  var tabs = new Tabs();
  tabs.addItem({'label': 'Reminder', 'descr': 'Reminder', 'object': 'Dummy'});
  tabs.addItem({'label': 'Scheduler', 'descr': 'Scheduler', 'object': 'Dummy'});
  tabs.addItem({'label': 'Reports', 'descr': 'Reports', 'object': 'Dummy'});
  this.mainWin.addItem(tabs);

  this.mainWin.show();
  this.mainWin.resize();
  tabs.element.addClass('schedulerTabs');
};

//******************************************************************************
//******************************************************************************
//* InputBox
function InputBox(className) {
  this.className = className || 'InputBox';
  this.type = 'text';
  this.placeholder = null;
  this.prompt = null;
};

//******************************************************************************
InputBox.prototype.show = function(container) {
  this.container = container || this.container;
  if(this.element)
    this.element.clear();
  else {
    this.element = new MyElement(null, 'input', this.className);
  };
  this.element.type = this.type;
  if(this.placeholder)
    this.element.placeholder = this.placeholder;
  if(this.prompt)
    this.element.addPrompt(this.prompt);
  this.container.appendChild(this.element);
  if(this.focus)
    this.element.focus();
};

//******************************************************************************
InputBox.prototype.getValue = function() {
  return this.element.value
}

//******************************************************************************
InputBox.prototype.toString = function() {return 'object "InputBox"'};
InputBox.doc = '';


//******************************************************************************
//******************************************************************************
//* Progressbar
function Progressbar(styleName) {
  this.style = styleName || 'progressbar';
  this.items = [];
};

//******************************************************************************
Progressbar.prototype.addItem = function(item) {
  this.items[this.items.length] = item;
};

//******************************************************************************
Progressbar.prototype.show = function(container) {
  this.container = container || this.container;
  if(this.element)
    this.element.clear();
  else {
    this.element = new Element(null, 'div', this.style);
    this.container.appendChild(this.element);
  }
  for(var i=0; i<this.items.length; i++) {
    this.items[i].element = new Element(null, 'div', this.style+'Item '+this.items[i].style);
    this.element.appendChild(this.items[i].element);
  };
  if(this.label) {
    this.labelElement = new Element(null, 'div', this.style+'Label', this.label);
    this.labelElement.append(this.label);
    this.element.appendChild(this.labelElement);
  };
};

//******************************************************************************
Progressbar.prototype.resize = function() {
console.log('Progressbar.resize()');
  var frameSize = this.items[0].element.getFrameSize();
  var width = this.container.getInnerWidth() - frameSize.frameVerWidth;
  var height = this.container.getInnerHeight() - frameSize.frameHorWidth
  var containerFrameSize = this.container.getFrameSize();
  this.container.style.borderStyle = 'none';
  this.container.style.paddingTop = containerFrameSize.paddingTop + containerFrameSize.borderTopWidth + 'px';
  this.container.style.paddingRight = containerFrameSize.paddingRight + containerFrameSize.borderRightWidth + 'px';
  this.container.style.paddingBottom = containerFrameSize.paddingBottom + containerFrameSize.borderBottomWidth + 'px';
  this.container.style.paddingLeft = containerFrameSize.paddingLeft + containerFrameSize.borderLeftWidth + 'px';
  for(var i=0; i<this.items.length; i++) {
    this.items[i].element.setWidth(this.items[i].value*width/100);
    this.items[i].element.setHeight(height);
    if(i > 0) {
      this.items[i].element.style.marginTop = -height - frameSize.frameTopWidth + 'px';
    };
  };
  if(this.labelElement) {
    this.labelElement.setWidth(width);
    this.labelElement.style.marginTop = -height - frameSize.frameHorWidth + 'px';
  };
};

//******************************************************************************
Progressbar.prototype.toString = function() {return 'object "Progressbar"'};
Progressbar.doc = '';