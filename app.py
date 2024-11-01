import os
from dotenv import load_dotenv

from flask import Flask, render_template, redirect, url_for

from urllib.parse import quote

from blueprints.auth import bp as auth_bp
from blueprints.profile import bp as profile_bp

from flask_login import LoginManager
from models.User import User

# Environment Variables
load_dotenv()

# App Configuration
app = Flask(__name__)
app.secret_key = os.environ.get('APP_SECRET_KEY')

# Pipelines
@app.template_filter('urlencode')
def pipeline_urlencode(s:str):
    return quote(s)

# Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)

# Flask Login
login_manager_app = LoginManager(app)

@login_manager_app.user_loader
def load_user(id: int):
    return User.from_id(id)

@login_manager_app.unauthorized_handler
def status_401():
    return redirect(url_for('auth.login'))