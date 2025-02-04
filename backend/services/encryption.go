package services

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
)

var secretKey []byte

func SetSecretKey(key string) {
	secretKey = []byte(key)
}

func EncryptContent(plaintext string) (string, error) {
	if len(secretKey) != 16 && len(secretKey) != 24 && len(secretKey) != 32 {
		return "", errors.New("invalid secretKey size: must be 16, 24, or 32 bytes")
	}

	block, err := aes.NewCipher(secretKey)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, 12)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	ciphertext := aesGCM.Seal(nil, nonce, []byte(plaintext), nil)

	result := append(nonce, ciphertext...)
	return base64.StdEncoding.EncodeToString(result), nil
}

func DecryptContent(encryptedContent string) (string, error) {
	if len(secretKey) != 16 && len(secretKey) != 24 && len(secretKey) != 32 {
		return "", errors.New("invalid secretKey size: must be 16, 24, or 32 bytes")
	}

	data, err := base64.StdEncoding.DecodeString(encryptedContent)
	if err != nil {
		return "", err
	}

	if len(data) < 12 {
		return "", errors.New("invalid ciphertext")
	}

	nonce, ciphertext := data[:12], data[12:]

	block, err := aes.NewCipher(secretKey)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", errors.New("decryption failed")
	}

	return string(plaintext), nil
}
