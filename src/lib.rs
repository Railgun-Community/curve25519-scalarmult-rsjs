use node_bindgen::core::{buffer::ArrayBuffer, buffer::JSArrayBuffer, NjError};
use node_bindgen::derive::node_bindgen;
use std::convert::TryInto;

use curve25519_dalek::edwards::CompressedEdwardsY;
use curve25519_dalek::edwards::EdwardsPoint;
use curve25519_dalek::scalar::Scalar;
use curve25519_dalek::traits::MultiscalarMul;

#[node_bindgen]
fn scalarmult(
    point_bytes: JSArrayBuffer,
    scalar_bytes: JSArrayBuffer,
) -> Result<ArrayBuffer, NjError> {
    let compressed_point = CompressedEdwardsY::from_slice(point_bytes.as_bytes());
    let inpoint = compressed_point.decompress().unwrap();

    let mut scalar_slice = scalar_bytes.to_vec();
    scalar_slice.reverse();
    let scalar = Scalar::from_bytes_mod_order(scalar_slice.try_into().expect("invalid"));

    let outpoint = EdwardsPoint::multiscalar_mul([scalar], [inpoint]);
    let outpoint_bytes = outpoint.compress().to_bytes();
    // Copy outpoint_bytes to a new JSArrayBuffer
    Ok(ArrayBuffer::new(outpoint_bytes.to_vec()))
}
