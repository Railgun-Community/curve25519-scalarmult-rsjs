use node_bindgen::core::{buffer::ArrayBuffer, buffer::JSArrayBuffer, NjError};
use node_bindgen::derive::node_bindgen;
use std::convert::TryInto;

use curve25519_dalek::edwards::CompressedEdwardsY;
use curve25519_dalek::edwards::EdwardsPoint;
use curve25519_dalek::scalar::Scalar;
use curve25519_dalek::traits::MultiscalarMul;

fn to32(bytes: JSArrayBuffer) -> Result<[u8; 32], NjError> {
    let bytes32: Result<[u8; 32], _> = bytes.to_vec().try_into();
    Ok(bytes32.map_err(|_| NjError::Other("invalid scalar size".to_owned()))?)
}

#[node_bindgen]
fn scalarmult(
    point_bytes: JSArrayBuffer,
    scalar_bytes: JSArrayBuffer,
) -> Result<ArrayBuffer, NjError> {
    let compressed_point = CompressedEdwardsY::from_slice(point_bytes.as_bytes());
    let inpoint = compressed_point
        .decompress()
        .ok_or(NjError::Other("invalid y coordinate".to_owned()))?;

    let mut scalar_bytes = to32(scalar_bytes)?;
    scalar_bytes.reverse();
    let scalar = Scalar::from_bytes_mod_order(scalar_bytes);

    let outpoint = EdwardsPoint::multiscalar_mul([scalar], [inpoint]);
    let outpoint_bytes = outpoint.compress().to_bytes();
    // Copy outpoint_bytes to a new JSArrayBuffer
    Ok(ArrayBuffer::new(outpoint_bytes.to_vec()))
}
