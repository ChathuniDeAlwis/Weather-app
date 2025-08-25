import os
from typing import Optional
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

_connection_pool: Optional[pooling.MySQLConnectionPool] = None


def _build_pool() -> pooling.MySQLConnectionPool:
	_dbconfig = {
		"host": os.getenv("DB_HOST", "127.0.0.1"),
		"port": int(os.getenv("DB_PORT", "3306")),
		"user": os.getenv("DB_USER", "root"),
		"password": os.getenv("DB_PASSWORD", ""),
		"database": os.getenv("DB_NAME", "snapabook"),
	}
	return pooling.MySQLConnectionPool(
		pool_name="snapabook_pool",
		pool_size=5,
		pool_reset_session=True,
		**_dbconfig,
	)


def _get_pool() -> pooling.MySQLConnectionPool:
	global _connection_pool
	if _connection_pool is None:
		_connection_pool = _build_pool()
	return _connection_pool


def get_connection():
	pool = _get_pool()
	return pool.get_connection()


def query_one(sql: str, params: tuple = ()):  # -> dict | None
	conn = get_connection()
	try:
		with conn.cursor(dictionary=True) as cur:
			cur.execute(sql, params)
			row = cur.fetchone()
			return row
	finally:
		conn.close()


def query_all(sql: str, params: tuple = ()):  # -> list[dict]
	conn = get_connection()
	try:
		with conn.cursor(dictionary=True) as cur:
			cur.execute(sql, params)
			rows = cur.fetchall()
			return rows
	finally:
		conn.close()


def execute(sql: str, params: tuple = ()) -> int:
	"""Execute INSERT/UPDATE/DELETE. Returns lastrowid when available, otherwise affected rows."""
	conn = get_connection()
	try:
		with conn.cursor() as cur:
			cur.execute(sql, params)
			conn.commit()
			return cur.lastrowid or cur.rowcount
	finally:
		conn.close()