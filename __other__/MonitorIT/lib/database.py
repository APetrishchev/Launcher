# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# from databases import Database

# if config.dbEngine == "sqlite":
# 	engine = create_engine(
# 	  f"sqlite:///{config.dbName}",
# 		connect_args={"check_same_thread": False}
# 	)
# else:
# 	engine = create_engine(f"postgresql://{config.dbUser}:{config.dbPasswd}@{config.dbHost}/{config.dbName}")
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

from pathlib import Path
import sqlite3
from lib.aobject import AObject

class Db(AObject):
	__conn = None

	def __init__(self):
		self.isChanged = False

	def connect(config):
		if config.dbEngine == "sqlite":
			Path(config.dbName).touch()
			Db.__conn = sqlite3.connect(config.dbName)
			Db.__conn.row_factory = Db.__dict_factory
		# else:
		# 	db = Database(f"postgresql://{config.dbUser}:{config.dbPasswd}@{config.dbHost}/{config.dbName}")

	def createTable(table, fields, optional=""):
		cur = Db.__conn.cursor()
		cur.execute(f"DROP TABLE IF EXISTS `{table}`;")
		cur.execute(f"CREATE TABLE {table} ({','.join(fields)}){optional};")

	def __dict_factory(cur, row):
		dict_ = {}
		for idx, col in enumerate(cur.description):
			dict_[col[0]] = row[idx]
		return dict_

	def get(self, table, **kvargs):
		where = None if not "where" in kvargs else kvargs["where"]
		cur = Db.__conn.cursor()
		# print(f"""SELECT {kvargs["fields"]} FROM {table}{"" if not where else f" WHERE {where}"};""")
		cur.execute(f"""SELECT {kvargs["fields"]} FROM {table}{"" if not where else f" WHERE {where}"};""")
		res = cur.fetchone()
		return res

	def getAll(self, table, **kvargs):
		where = None if not "where" in kvargs else kvargs["where"]
		cur = Db.__conn.cursor()
		# print(f"""SELECT {kvargs["fields"]} FROM {table}{"" if not where else f" WHERE {where}"};""")
		cur.execute(f"""SELECT {kvargs["fields"]} FROM {table}{"" if not where else f" WHERE {where}"};""")
		# for item in cur.fetchall():
		# 	yield item
		res = cur.fetchall()
		return res

	def add(self, table, **kvargs):
		del kvargs["isChanged"]
		cur = Db.__conn.cursor()
		values = list(kvargs.values())
		query = f"""INSERT INTO {table} ({",".join(kvargs.keys())}) VALUES ({"?," * (len(values) - 1) + "?"});"""
		# print(query)
		# print(values)
		cur.execute(query, values)
		self.isChanged = False
		return cur.lastrowid

	def update(self, table, where, **kvargs):
		try:
			if self.isChanged:
				del kvargs["isChanged"]
				cur = Db.__conn.cursor()
				values = list(kvargs.values())
				query = f"""UPDATE {table} SET {",".join([f"{key}=?" for key in kvargs.keys()])} WHERE {where};"""
				print(query)
				print(values)
				cur.execute(query, values)
				self.isChanged = False
		except Exception as exc:
			print(f"{exc}\n{query}\n{values}")
			# raise exc

	def delete(self, table, where):
		cur = Db.__conn.cursor()
		cur.execute(f"DELETE FROM {table} WHERE {where};")
		self.isChanged = False

	def commit():
		Db.__conn.commit()

	def rollback():
		Db.__conn.rollback()

	def close():
		Db.__conn.close()
