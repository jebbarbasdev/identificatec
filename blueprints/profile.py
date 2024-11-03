from flask import Blueprint, render_template, request, send_file
from flask_login import login_required, current_user

from models.UserPicture import UserPicture

from utils.Result import Result
from utils.AImage import AImage
from utils.cloudinary import upload_aimage

bp = Blueprint('profile', __name__, url_prefix='/profile')

@bp.route('/', methods=['GET'])
@login_required
def index():
    return render_template('profile/index.html', title='My Profile')

@bp.route('/photos', methods=['GET', 'POST'])
@login_required
def photos():
    if request.method == 'GET':
        try:
            list_of_photos = UserPicture.from_user_id(current_user.id)
            list_of_photos_dto = [{ 
                    'id': photo.id,
                    'url': photo.photo_url
                } for photo in list_of_photos]
            
            return Result.from_data(list_of_photos_dto)
        except Exception as ex:
            return Result.from_exception(ex)
    elif request.method == 'POST':
        try:
            photo = request.files.get('photo')
            if photo is None: return Result.from_bad_request('Photo not found')

            # Uso AImage para obtener las caras (si las hay) de la foto
            aimage = AImage(photo)

            # Subo la foto y obtengo su nuevo URL
            photo_url = upload_aimage(aimage)

            # Obtengo el embedding de la foto
            embedding = aimage.to_embedding()

            # Usando el modelo creo un nuevo registro en la tabla de fotos de un usuario
            UserPicture.create(photo_url, embedding, current_user.id)

            # Si todo ha ido bien, regreso un OK
            return Result.from_ok()
        except Exception as ex:
            return Result.from_exception(ex)
