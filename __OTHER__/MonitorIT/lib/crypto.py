import hashlib
import base64
from Crypto.PublicKey import RSA as RSA_
from Crypto import Random
from Crypto.Cipher import AES as AES_, PKCS1_OAEP

def md5(string):
	return hashlib.md5(string.encode()).hexdigest()

class AES(object):
	def __init__(self, password):
		self.key = hashlib.sha256(password.encode()).digest()

	@staticmethod
	def __pad(raw):
		pad = AES_.block_size - len(raw) % AES_.block_size
		return raw + pad * chr(pad)

	@staticmethod
	def __unpad(raw):
		return raw[:-ord(raw[len(raw)-1:])]

	def encrypt(self, raw):
		iv = Random.new().read(AES_.block_size)
		return base64.b64encode(iv + AES_.new(self.key, AES_.MODE_CBC, iv).encrypt(AES.__pad(raw).encode()))

	def decrypt(self, enc):
		enc = base64.b64decode(enc)
		iv = enc[:AES_.block_size]
		return AES.__unpad(AES_.new(self.key, AES_.MODE_CBC, iv).decrypt(enc[AES_.block_size:])).decode()

class RSA(object):
	@staticmethod
	def generate(password):
		keys = RSA_.generate(2048)
		return keys.publickey().exportKey(), keys.exportKey(passphrase=password, pkcs=8, protection="scryptAndAES128-CBC")

	@staticmethod
	def encrypt(raw, pubKey):
		publicKey = RSA_.import_key(pubKey)
		cipherRSA = PKCS1_OAEP.new(publicKey)
		sesKey = Random.get_random_bytes(16)
		cipherAES = AES_.new(sesKey, AES_.MODE_EAX)
		enc, tag = cipherAES.encrypt_and_digest(raw.encode())
		res = cipherRSA.encrypt(sesKey)
		res += cipherAES.nonce
		res += tag
		res += enc
		return res

	@staticmethod
	def decrypt(enc, encPrivKey, password):
		privKey = RSA_.import_key(encPrivKey, passphrase=password)
		idx = privKey.size_in_bytes()
		encSesKey = enc[0:idx]
		nonce = enc[idx:idx+16]
		tag = enc[idx+16:idx+32]
		encryptedString = enc[idx+32:]
		cipherRSA = PKCS1_OAEP.new(privKey)
		sesKey = cipherRSA.decrypt(encSesKey)
		cipherAES = AES_.new(sesKey, AES_.MODE_EAX, nonce)
		return cipherAES.decrypt_and_verify(encryptedString, tag).decode()
