from flask import Blueprint, request, render_template, redirect, url_for
from flask_login import login_user, login_required, logout_user
from models.User import User
from utils.Result import Result
from utils.annonymus_required import anonymous_required
from utils.validations import is_valid_str

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

            if not is_valid_str(email): raise Exception(f'Parameter "email" is required and can\'t be whitespaces') 
            if not is_valid_str(password): raise Exception(f'Parameter "password" is required and can\'t be whitespaces') 
            
            user = User.login(email, password)

            if user is None:
                return Result.from_not_found('User not found or incorrect password')
            
            login_user(user)
            return Result.from_data({ 'redirect_url': url_for('profile.index') })
        except Exception as ex:
            return Result.from_exception(ex)

@bp.route('/sign-up', methods=['GET', 'POST'])
@anonymous_required
def sign_up():
    return redirect(url_for('login'))

@bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect('login')