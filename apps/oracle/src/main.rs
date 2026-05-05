//! strongest re-encryption oracle (single-node TEE attestor).
//!
//! Endpoint: POST /reencrypt
//!   Input  : { old_blob, old_owner, new_owner, token_id, owner_sig }
//!   Output : { new_blob, attestation }
//!
//! Crypto:
//!   K_M       — master key, generated inside the TEE, never extractable
//!   K_old     = HKDF(K_M, salt = token_id || old_owner, info = "openclaw-0g-agent-v1")
//!   K_new     = HKDF(K_M, salt = token_id || new_owner, info = "openclaw-0g-agent-v1")
//!   plaintext = AES-256-GCM-decrypt(K_old, old_blob)
//!   new_blob  = AES-256-GCM-encrypt(K_new, plaintext)
//!   attest    = ECDSA-secp256k1(K_oracle, keccak256(old_hash || new_hash || ...))
//!
//! See ../../../openclaw-0g-hackathon/architecture/inft-design.md.

use std::net::SocketAddr;

use axum::{routing::{get, post}, Json, Router};
use serde::{Deserialize, Serialize};
use tracing::info;

#[derive(Debug, Deserialize)]
struct ReencryptRequest {
    /// Hex-encoded ciphertext currently associated with the token.
    old_blob: String,
    /// 0x-prefixed address of the current owner.
    old_owner: String,
    /// 0x-prefixed address of the new owner.
    new_owner: String,
    /// Stringified ERC-7857 tokenId.
    token_id: String,
    /// Hex-encoded ECDSA signature from old_owner authorizing the transfer.
    owner_sig: String,
}

#[derive(Debug, Serialize)]
struct ReencryptResponse {
    new_blob: String,
    attestation: String,
    new_owner: String,
    token_id: String,
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    ok: bool,
    version: &'static str,
    mode: &'static str,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse { ok: true, version: env!("CARGO_PKG_VERSION"), mode: "stub" })
}

async fn reencrypt(Json(_req): Json<ReencryptRequest>) -> Json<ReencryptResponse> {
    // TODO(Day 7):
    //   1. Verify owner_sig over (token_id, old_owner, new_owner) against old_owner address
    //   2. Derive K_old, K_new via HKDF(K_M, salt, info)
    //   3. AES-256-GCM decrypt old_blob with K_old → plaintext
    //   4. AES-256-GCM encrypt plaintext with K_new → new_blob
    //   5. Compute keccak256(old_hash || new_hash || token_id || old_owner || new_owner)
    //   6. ECDSA-sign with K_oracle (TEE-derived) → attestation
    //   7. Return { new_blob, attestation, ... }
    Json(ReencryptResponse {
        new_blob: "0x".to_string(),
        attestation: "0x".to_string(),
        new_owner: String::new(),
        token_id: String::new(),
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| "info".into()))
        .init();

    let app = Router::new()
        .route("/health", get(health))
        .route("/reencrypt", post(reencrypt));

    let addr: SocketAddr = std::env::var("ORACLE_BIND")
        .unwrap_or_else(|_| "0.0.0.0:8787".to_string())
        .parse()
        .expect("invalid ORACLE_BIND");

    info!("strongest-oracle listening on {addr}");
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind failed");
    axum::serve(listener, app).await.expect("server error");
}
