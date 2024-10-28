import re

def is_valid_str(param: any):
    if not param: return False
    if not isinstance(param, str): return False
    if param.isspace(): return False
    return True

def is_valid_str_or_isspace(param: any):
    if not isinstance(param, str): return False
    return True

def is_valid_str_or_null(param: any):
    if param is None: return True
    return is_valid_str(param)

def is_valid_email(param: any):
    if not is_valid_str(param): return False

    email_regex = r"^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$"
    return re.fullmatch(email_regex, param) is not None

def is_secure_password(param: any):
    if not is_valid_str(param): return False

    # 14 characters, 1 lowercase letter, 1 uppercase letter, 1 digit and 1 symbol
    secure_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{14,}$"
    return re.match(secure_regex, param) is not None

def is_valid_yes_no(param: any):
    if not is_valid_str_or_isspace(param): return False
    return param.lower() in ('y', 'yes', 'n', 'no', '') 