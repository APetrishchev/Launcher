  white-space: nowrap;

  display: inline-block;


#*******************************************************************************
grp_usr = []
#grp_usr[grp_usr.length] = [grpId, usrId]
grp_usr.append(['DevGroup', 'VVoropaev'])

#*******************************************************************************
usrGrps = []
usrGrp = {}
usrGrps.append(usrGrp)
usrGrp['id'] = 'DevGroup'
usrGrp['ownerId'] = 'APetrishchev' #id профиля пользователя-владельца группы
usrGrp['shortDescr'] = 'MyDevelopersGroup'

#*******************************************************************************
# permissions
read = 0x01 #разрешает читать содержимое объекта или контейнера
append = 0x02 #разрешает дописывать данные в конец файла
write = 0x04 #разрешает запись в файл
addFile = 0x02 #разрешает добавлять новые объекты в контейнер. Для добавленного объекта будут установлены атрибуты в соответствии с 'newObject'
addDir = 0x04 #разрешает добавлять новые контейнеры в контейнер. Для добавленного контейнера будут установлены атрибуты в соответствии с 'newContainer'
remove = 0x08 #разрешает удалить контейнер или файл. При удалении контейнера декрементируется количество ссылок для самого контейнера и количество ссылок для каждого из объектов содержащихся в контейнере, если количество ссылок равно нулю, контейнер/объект удаляется
#***************************************
permissions = []
#*******************
perm = {}
permissions.append(perm);
perm['id '] = '' 
perm['usrGrpId'] = 'DevGroup'
perm['permit'] = read + write + remove
#*******************
perm = {}
permissions.append(perm);
perm['id '] = ''
perm['usrGrpId'] = 'DevGroup'
perm['newObject'] = read + write + remove
perm['newContainer'] = read + addFile + addDir + remove
perm['permit'] = read + addFile + addDir + remove

#*******************************************************************************
files = []
#*******************
file = {}
files.append(file)
file['id'] = 1
file['checksum'] = 0
file['owner'] = 'Petrishchev' #profileId
file['type'] =  'dir' #dir|bin|txt|xml|py|html|css|js|pic|...
file['cTime'] = 0 #timestamp
file['aTime'] = 0 #timestamp
file['mTime'] = 0 #timestamp
file['size'] = 0
file['arc'] = False
file['readOnly'] = False
file['hide'] = False #скрывает имя контейнера/объекта в списке родительского контейнера
file['links'] = 1
file['fullName'] = '/path/fileName'

