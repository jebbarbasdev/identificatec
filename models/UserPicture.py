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

    @classmethod
    def from_nearest_embedding(cls, embedding: List[float]):
        """
        Recibe un embedding de una AImage y consulta la base de datos la imagen
        mas cercana usando diferencia de vectores, junto con su distancia
        """
        
        nearest_photo = psql("""
            SELECT
                id,
                photo_url,
                embedding,
                created_at,
                deleted,
                deleted_at,
                user_id,
                             
                embedding <-> %s::vector AS distance
            FROM identification.user_picture
            WHERE NOT deleted 
            ORDER BY distance
            LIMIT 1
        """, [embedding])

        if len(nearest_photo) == 0: return None

        id, photo_url, embedding, created_at, deleted, deleted_at, user_id, distance = nearest_photo[0]
        user_photo = UserPicture(id, photo_url, embedding, created_at, deleted, deleted_at, user_id)

        return user_photo, distance
    
    @classmethod
    def set_profile_picture(cls, user_picture_id: int) -> str:
        """
        Usando el user_id de la user_picture, establece el photo_url del usuario 
        al photo_url de la user_picture
        """

        # Obtenemos la photo_url y el user_id de la foto
        rows = psql("""
            SELECT 
                photo_url, 
                user_id 
            FROM identification.user_picture
            WHERE id = %s
        """, [user_picture_id])
        photo_url, user_id = rows[0]

        # Usando estos datos, actualizamos el usuario y regresamos el photo_url para 
        # actualizar el frontend
        rows2 = psql("""
            UPDATE auth.user SET
                photo_url = %s
            WHERE id = %s
            RETURNING photo_url
        """, [photo_url, user_id])

        return rows2[0][0]

    @classmethod
    def soft_delete(cls, user_picture_id: int):
        """
        Soft deletea la foto, es decir, pone su atributo deleted en true,
        y asigna la fecha de borrado a este momento, como extra, si algun usuario
        (aunque en realidad solo podria tenerla el dueño) tiene el url como foto de perfil,
        pone este valor en null. Regresa la cantidad de registros afectados (0,1)
        """

        # Actualizamos y regresamos el photo_url, para usarlo en el borrado de
        # foto de perfil
        photo_urls = psql("""
            UPDATE identification.user_picture SET
                deleted = true,
                deleted_at = %s
            WHERE
                id = %s
            RETURNING photo_url
        """, [datetime.now(), user_picture_id])

        photo_url = photo_urls[0][0]

        # Usando el photo_url, seteamos en null los url_photo de los usuarios
        # que la utilicen

        rows = psql("""
            UPDATE auth.user SET
                photo_url = null
            WHERE
                photo_url = %s
            RETURNING id
        """, [photo_url])

        return len(rows)