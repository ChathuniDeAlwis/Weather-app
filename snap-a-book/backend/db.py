import os
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

_dbconfig = {
	"host": os.getenv("DB_HOST", "127.0.0.1"),
	"user": os.getenv("DB_USER", "root"),
	"password": os.getenv("DB_PASSWORD", ""),
	"database": os.getenv("DB_NAME", "snapabook"),
	"port": int(os.getenv("DB_PORT", "3306")),
}

connection_pool = pooling.MySQLConnectionPool(
	pool_name="snapabook_pool",
	pool_size=5,
	pool_reset_session=True,
	**_dbconfig,
)


def get_connection():
	return connection_pool.get_connection()