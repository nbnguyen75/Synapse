import sys
import os
import hashlib
import base64
import getpass

def generate_rabbitmq_hash(password: str) -> str:
    salt = os.urandom(4)
    sha256_hash = hashlib.sha256(salt + password.encode('utf-8')).digest()
    return base64.b64encode(salt + sha256_hash).decode('utf-8')

if __name__ == "__main__":
    raw_password = getpass.getpass("Nhập mật khẩu RabbitMQ: ")
    
    if not raw_password:
        print("Mật khẩu không được để trống!")
        sys.exit(1)
        
    hashed_password = generate_rabbitmq_hash(raw_password)
    print(f"Password Hash: {hashed_password}")