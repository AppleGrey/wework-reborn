package password

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword 对密码进行 bcrypt 加密
func HashPassword(password string) (string, error) {
	// 使用默认的 cost (10)，这是安全性和性能的良好平衡
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

// VerifyPassword 验证密码是否正确
func VerifyPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}
