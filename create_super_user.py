from getpass import getpass
from argparse import ArgumentParser
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

from utils.psql import psql
from utils.validations import is_valid_email, is_valid_str, is_secure_password, is_valid_yes_no

load_dotenv()

# Define argumen parser
parser = ArgumentParser()
parser.add_argument("--role", type=str, help="Role of the created user", default="Super User")
args = parser.parse_args()

# Checking if given role exist or creating it otherwise
role = args.role

if not is_valid_str(role):
    print("Invalid role, stopping execution...")
    exit()

role_exists = int(psql("SELECT COUNT(*) FROM auth.role WHERE name = %s", [role])[0][0]) > 0
if not role_exists:
    while not is_valid_yes_no(create_role_answer := input(f"Role '{role}' does not exist, do you want to create it? (Y/n): ")):
        print('Invalid answer, try again')
    
    if create_role_answer == '' or create_role_answer.lower()[0] == 'y':
        role_id = psql("INSERT INTO auth.role (name) VALUES (%s) RETURNING id;", [role])[0][0]
        print(f"Role '{role}' created successfully with id: {role_id}")
    else:
        print('Invalid role, stopping execution...')
        exit()

# Asking for data
while not is_valid_str(first_name := input("Enter your first name: ")):
    print('Invalid first name, try again')

while not is_valid_str(last_name := input("Enter your last name: ")):
    print('Invalid last name, try again')

while not is_valid_email(email := input("Enter your email: ")):
    print('Invalid email, try again')

while not is_secure_password(password := getpass("Enter your password: ")):
    print('Insecure password, enter at least 14 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 symbol and try again')

while not password == (c_password := getpass("Confirm your password: ")):
    print('Passwords do not match, try again')

# Create user

hashed_password = generate_password_hash(password)

rows = psql("""
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
            SELECT id FROM auth.role WHERE name = %s
        ) 
    )
    RETURNING id;
""", [first_name, last_name, email, hashed_password, args.role])

new_id = rows[0][0]

print(f"User created successfully with id: {new_id}")