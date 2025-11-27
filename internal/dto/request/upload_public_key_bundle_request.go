package request

// UploadPublicKeyBundleRequest 上传公钥束请求
// 注意：不包含 user_id，用户身份从 JWT token 中获取，更安全
type UploadPublicKeyBundleRequest struct {
	IdentityKeyPublic           string              `json:"identity_key_public" binding:"required"`
	IdentityKeyPublicCurve25519 string              `json:"identity_key_public_curve25519" binding:"required"`
	SignedPreKey                SignedPreKeyData    `json:"signed_pre_key" binding:"required"`
	OneTimePreKeys              []OneTimePreKeyData `json:"one_time_pre_keys" binding:"required,min=1"`
}
