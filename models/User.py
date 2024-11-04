from datetime import datetime
from flask_login import UserMixin
from utils.psql import psql
from typing import Optional
from werkzeug.security import check_password_hash, generate_password_hash
from urllib.parse import quote

class User(UserMixin):
    __id: int

    __first_name: str
    __last_name: str
    __email: str
    __password: str
    __photo_url: Optional[str]

    __created_at: datetime

    __updated_at: Optional[datetime]

    __deleted: bool
    __deleted_at: Optional[datetime]

    __role_id: int
    __role_name: str

    def __init__(
        self, 

        id: int, 

        first_name: str, 
        last_name: str, 
        email: str, 
        password: str,
        photo_url: Optional[str],

        created_at: datetime, 

        updated_at: Optional[datetime], 

        deleted: bool,
        deleted_at: Optional[datetime],

        role_id: int,
        role_name: str
    ):
        self.__id = id

        self.__first_name = first_name
        self.__last_name = last_name
        self.__email = email
        self.__password = password
        self.__photo_url = photo_url

        self.__created_at = created_at

        self.__updated_at = updated_at

        self.__deleted = deleted
        self.__deleted_at = deleted_at

        self.__role_id = role_id
        self.__role_name = role_name

    @property
    def id(self): return self.__id

    @property
    def first_name(self): return self.__first_name

    @property
    def last_name(self): return self.__last_name

    @property
    def email(self): return self.__email

    @property
    def password(self): return self.__password

    @property
    def dicebear_photo_url(self): return f'https://api.dicebear.com/9.x/initials/svg?seed={quote(self.full_name)}'

    @property
    def photo_url(self):
        # If photo url is null, return a placeholder from dicebear 
        return self.__photo_url or self.dicebear_photo_url

    @property
    def created_at(self): return self.__created_at

    @property
    def updated_at(self): return self.__updated_at

    @property
    def deleted(self): return self.__deleted

    @property
    def deleted_at(self): return self.__deleted_at

    @property
    def role_id(self): return self.__role_id

    @property
    def role_name(self): return self.__role_name

    # Calculated
    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'

    @classmethod
    def from_id(cls, id: int):
        users = psql("""
            SELECT 
                auth.user.id, 
                first_name,
                last_name,
                email,
                password,
                photo_url,
                created_at, 
                updated_at, 
                deleted,
                deleted_at,
                
                role_id,
                name
            FROM auth.user 
            JOIN auth.role ON auth.user.role_id = auth.role.id
            WHERE auth.user.id = %s
        """, [id])

        if len(users) == 0: return None

        user_id, first_name, last_name, email, password, photo_url, created_at, updated_at, deleted, deleted_at, role_id, role_name = users[0]
        return User(user_id, first_name, last_name, email, password, photo_url, created_at, updated_at, deleted, deleted_at, role_id, role_name)

    @classmethod
    def login(cls, email:str, password:str):
        users = psql("""
            SELECT 
                id,
                password
            FROM auth.user
            WHERE 
                email = %s AND
                NOT deleted
        """, [email])

        if len(users) == 0: return None

        user_id, user_password = users[0]

        if not check_password_hash(user_password, password): return None

        return User.from_id(user_id)

    @classmethod
    def sign_up(cls, first_name:str, last_name:str, email:str, password:str) -> int:
        hashed_password = generate_password_hash(password)

        # Create a user with the hashed_password
        users = psql("""
            INSERT INTO auth.user (
                first_name, 
                last_name, 
                email, 
                password, 
                role_id
            ) 
            VALUES (
                %s,
                %s,
                %s,
                %s,
                (
                    SELECT id FROM auth.role WHERE name = 'User'
                ) 
            )
            RETURNING id;
        """, [first_name, last_name, email, hashed_password])

        id = users[0][0]

        # Una vez creado el usuario, regresamos un usuario usando este id
        return cls.from_id(id)