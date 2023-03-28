#[cfg(not(target_os = "macos"))]
fn main() {
}

#[cfg(target_os = "macos")]
fn main() {
  node_bindgen::build::configure();
}