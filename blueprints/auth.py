from flask import Blueprint, request, render_template, redirect, url_for
from flask_login import login_user, login_required, logout_user

from models.User import User
from models.UserPicture import UserPicture

from utils.Result import Result
from utils.annonymus_required import anonymous_required
from utils.validations import is_valid_str, is_valid_email, is_secure_password
from utils.AImage import AImage

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/login', methods=["GET", "POST"])
@anonymous_required()
def login():
    if request.method == "GET":
        return render_template('auth/login.html', title='Login')
    elif request.method == "POST":
        try:
            body = request.get_json()

            email = body.get('email')
            password = body.get('password')

            if not is_valid_str(email): return Result.from_bad_request(f'Parameter "email" is required and can\'t be whitespaces') 
            if not is_valid_str(password): raise Result.from_bad_request(f'Parameter "password" is required and can\'t be whitespaces') 
            
            user = User.login(email, password)

            if user is None:
                return Result.from_not_found('User not found or incorrect password')
            
            login_user(user)
            return Result.from_data({ 'redirect_url': url_for('profile.index') })
        except Exception as ex:
            return Result.from_exception(ex)

@bp.route('/recognition', methods=['GET', 'POST'])
@anonymous_required()
def recognition():
    if request.method == 'POST':
        try:
            photo = request.files.get('photo')
            if photo is None: return Result.from_bad_request('Photo not found')

            # Uso AImage para obtener las caras (si las hay) de la foto
            aimage = AImage(photo)
            embedding = aimage.to_embedding()

            # Usamos el embedding para obtener la imagen que mas se le parece
            detection = UserPicture.from_nearest_embedding(embedding)
            if detection is None: return Result.from_not_found("User not found")

            user_photo, distance = detection

            # TODO: Verificar si la distancia es menor al threshold

            # Teniendo el ID del usuario, podemos obtenerlo 
            user = User.from_id(user_photo.user_id)
            if user is None: return Result.from_not_found("User not found")

            print(f"{user.full_name} ha iniciado sesion con una distancia de {distance}")

            # Teniendo el usuario, inicio sesion y regreso el nombre y url
            login_user(user)

            dto = { 'user_name': user.full_name, 'distance': distance, 'redirect_url': url_for('profile.index') }
            return Result.from_data(dto)
        except Exception as ex:
            return Result.from_exception(ex)

@bp.route('/sign-up', methods=['GET', 'POST'])
@anonymous_required()
def sign_up():
    if request.method == "GET":
        return render_template('auth/signUp.html', title='Sign Up')
    elif request.method == 'POST':
        try: 
            body = request.get_json()

            first_name = body.get('firstName')
            last_name = body.get('lastName')
            email = body.get('email')
            password = body.get('password')

            if not is_valid_str(first_name): return Result.from_bad_request('Parameter "firstName" is required and cannot be whitespace')
            if not is_valid_str(last_name): return Result.from_bad_request('Parameter "lastName" is required and cannot be whitespace')
            if not is_valid_email(email): return Result.from_bad_request('Parameter "email" is required and must be a valid email')
            if not is_secure_password(password): return Result.from_bad_request('Parameter "password" is required and must be a secure password (at least 14 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 symbol)')

            # Creamos el usuario, y lo obtenemos
            user = User.sign_up(first_name, last_name, email, password)

            if user is None: raise Exception('Something gone wrong while signing up, please try again')

            login_user(user)
            return Result.from_data({ 'redirect_url': url_for('profile.index') })
        except Exception as ex:
            return Result.from_exception(ex)

@bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))