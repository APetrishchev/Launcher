      var tabs = new Tabs();
      for(var c = 1; c < 6; c++) {
        tabs.addItem(null, {label: Calendar.dayName(c, true), descr: '', treeItem: item, closable: false});
      };
      tabs.addItem(null, {label: Calendar.dayName(6, true), descr: '', treeItem: item, closable: false});
      tabs.addItem(null, {label: Calendar.dayName(7, true), descr: '', treeItem: item, closable: false});
      tabs.show(app.mainWin.tree.detailsElement);

#!/usr/bin/python
#-*- coding: utf-8 -*-
from __future__ import unicode_literals
import datetime
import sys
import re
import json
import urllib2

#*******************************************************************************
#*******************************************************************************
#* Player
class Player():
  def __init__(self):
    self.tvProg = []
    obj = {}
    obj['chId'] = 140
    obj['date'] = str(datetime.date.today())
    obj['tvProg'] = json.dumps((
      ('05:00', '"Территория заблуждений" с Игорем Прокопенко | 16+'),
      ('06:00', 'Документальный проект | 16+'),
      ('07:00', 'С бодрым утром! | 16+'),
      ('08:30', 'Новости | 16+'),
      ('09:00', 'Документальный проект | 16+'),
      ('12:00', 'Информационная программа 112 | 16+')
    ))
    print obj
    self.tvProg.append(obj)

#*******************************************************************************
  @staticmethod
  def tv(params):
    try:
      url = 'http://www.ontvtime.ru/live/russia24.html'
      request = urllib2.Request(url, None, headers)
      headers = {'User-Agent' : 'Mozilla 5.10'}
      response = urllib2.urlopen(request)
      cookie = unicode(response.headers['Set-Cookie'], 'utf-8')
      result = re.search(r'tv=(\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3})%3A(\d{1,5})', cookie)
      if result:
        host = '%s:%s' % (result.group(1), result.group(2))
        result = re.search(r'tv2=([0-9a-z]+)', cookie)
        if result:
          sid = result.group(1)
          result = {'host': host, 'sid': sid}
          print '%s\n' % result
    except Exception, e:
      print 'error', e
      
#*******************************************************************************
  @staticmethod
  def getTvProg(chId, date=None):
    if not date:
      date = str(datetime.date.today()) 
    query  = 'SELECT tvProg FROM player_tvProg WHERE chId = %s AND date = %s' % (chId, date)
    #db.execute(query)
    #tvProg = db.fechone()
    #result = Player().tvProg[0]
    result = None
    if not result:
      url = 'http://www.ontvtime.ru/tv/?cat=17&mode=0&dates0=%s&ch0=%s' % (date, chId)
      headers = {'User-Agent' : 'Mozilla 5.10'}
      request = urllib2.Request(url, None, headers)
      response = urllib2.urlopen(request)
      result = response.read().decode('windows-1251').encode('utf-8')
      if result:
        regex = re.compile(r'<div class="ann_time1">([^<]+)</div>\s*<div class="text_prg_tv">(?:<[^<]+>|\s)*<b>([^<]+)<\/b>', re.DOTALL)
        res = regex.findall(result)
        tvProg = []
        for row in res:
          tvProg.append((row[0].strip(), row[1].strip()))
        query  = "INSERT INTO player_tvProg SET tvProg = '%s' WHERE chId = %s AND date = '%s'" % (json.dumps(tvProg) ,chId, date)
        #db.execute(query)
    else:
      tvProg = json.loads(result['tvProg'])
    return {'chId' : chId, 'date': date, 'tvProg': tvProg}

#*******************************************************************************
if __name__ == '__main__':
  #res = Player.getTvProg(158) #Russia1
  res = Player.getTvProg(140, '2017-04-21') #RenTv
  print res['chId']
  print res['date']
  for row in res['tvProg']:
    print row[0], row[1]
