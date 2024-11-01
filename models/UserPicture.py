from typing import List, Optional
from datetime import datetime
from utils.psql import psql

class UserPicture:
    __id: int

    __photo_url: str
    __embedding: List[float]

    __created_at: datetime

    __deleted: bool
    __deleted_at: Optional[datetime]

    __user_id: int

    def __init__(self, id: int, photo_url: str, embedding: List[float], created_at: datetime, deleted: bool, deleted_at: Optional[datetime], user_id: int):
        self.__id = id

        self.__photo_url = photo_url
        self.__embedding = embedding

        self.__created_at = created_at

        self.__deleted = deleted
        self.__deleted_at = deleted_at

        self.__user_id = user_id

    @property
    def id(self): return self.__id

    @property
    def photo_url(self): return self.__photo_url

    @property
    def embedding(self): return self.__embedding

    @property
    def created_at(self): return self.__created_at

    @property
    def deleted(self): return self.__deleted

    @property
    def deleted_at(self): return self.__deleted_at

    @property
    def user_id(self): return self.__user_id

    @classmethod
    def from_tuple(cls, tuple: tuple):
        id, photo_url, embedding, created_at, deleted, deleted_at, user_id = tuple
        return UserPicture(id, photo_url, embedding, created_at, deleted, deleted_at, user_id)

    @classmethod
    def from_user_id(cls, user_id: int):
        photos = psql("""
            SELECT
                id,
                photo_url,
                embedding,
                created_at,
                deleted,
                deleted_at,
                user_id
            FROM identification.user_picture
            WHERE 
                user_id = %s AND
                NOT deleted
        """, [user_id])

        list_of_photos = list(map(cls.from_tuple, photos))
        return list_of_photos

    @classmethod
    def create(cls, photo_url: str, embedding: List[float], user_id: int):
        psql("""
            INSERT INTO identification.user_picture (
                photo_url,
                embedding,
                user_id
            ) VALUES (
                %s,
                %s,
                %s
            )
            RETURNING id;
        """, [photo_url, embedding, user_id])
        