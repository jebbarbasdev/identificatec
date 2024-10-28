from functools import wraps
from flask import redirect, url_for
from flask_login import current_user

# Definir el decorador "anonymous_required" con un parámetro opcional
def anonymous_required(redirect_to='profile.index'):
    def decorator(route_function):
        @wraps(route_function)
        def decorated_function(*args, **kwargs):
            if current_user.is_authenticated:
                # Redirige a la página especificada si el usuario ya está autenticado
                return redirect(url_for(redirect_to))
            # Si no está autenticado, continúa con la función original
            return route_function(*args, **kwargs)
        return decorated_function
    return decorator
