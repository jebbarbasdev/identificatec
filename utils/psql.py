import os
import psycopg2

def psql(query: str, params: list = None):
    connection_string = os.environ.get('DB_CONNECTION_STRING')
    assert type(connection_string) == str

    conn = psycopg2.connect(connection_string)
    cur = conn.cursor()
    
    cur.execute(query, params)
    conn.commit()

    return cur.fetchall()