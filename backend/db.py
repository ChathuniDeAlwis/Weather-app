import os
from typing import Any, Iterable, Optional

import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

_pool: Optional[pooling.MySQLConnectionPool] = None


def _create_pool() -> pooling.MySQLConnectionPool:
    return pooling.MySQLConnectionPool(
        pool_name="snapabook_pool",
        pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "snapabook"),
        charset="utf8mb4",
        collation="utf8mb4_unicode_ci",
    )


def get_connection():
    global _pool
    if _pool is None:
        _pool = _create_pool()
    return _pool.get_connection()


def query_one(cnx, sql: str, params: Optional[Iterable[Any]] = None):
    with cnx.cursor() as cur:
        cur.execute(sql, params or tuple())
        return cur.fetchone()


def query_all(cnx, sql: str, params: Optional[Iterable[Any]] = None):
    with cnx.cursor() as cur:
        cur.execute(sql, params or tuple())
        return cur.fetchall()


def execute(cnx, sql: str, params: Optional[Iterable[Any]] = None):
    with cnx.cursor() as cur:
        cur.execute(sql, params or tuple())
        cnx.commit()