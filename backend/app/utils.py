import hashlib
import secrets

def generate_salt() -> str:
    """Rastgele salt üret"""
    return secrets.token_hex(15)  # 30 karakter

def hash_password(password: str, salt: str) -> str:
    """Password'u salt ile hashle"""
    salted = f"{password}{salt}"
    return hashlib.sha256(salted.encode()).hexdigest()

def verify_password(password: str, salt: str, password_hash: str) -> bool:
    """Password doğrulama"""
    return hash_password(password, salt) == password_hash