import os
import mysql.connector


def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get('MYSQL_HOST', '127.0.0.1'),
        user=os.environ.get('MYSQL_USER', 'root'),
        password=os.environ.get('MYSQL_PASSWORD', ''),
        database=os.environ.get('MYSQL_DATABASE', 'snapabook'),
        port=int(os.environ.get('MYSQL_PORT', '3306')),
        autocommit=False,
    )

