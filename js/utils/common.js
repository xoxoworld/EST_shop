//로컬스토리지에서 장바구니 읽기
export function readCart() {
  try {
    return JSON.parse(window.localStorage.getItem("cart")) || [];
  } catch (error) {
    console.error("장바구니 데이터를 읽는 중 오류 발생", error);
    return [];
  }
}

//로컬스토리지에서 장바구니 쓰기
export function writeCart(cart) {
  window.localStorage.setItem("cart", JSON.stringify(cart));
}

//장바구니 총 상품 개수 구하기
export function getCartCount() {
  const cart = readCart();
  return cart.reduce((total, item) => total + item.qty, 0);
}

//헤더 상단 장바구니 개수 출력
export function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  if (!cartCount) return;
  cartCount.textContent = getCartCount();
}

//장바구니 버튼 클릭시 장바구니 추가
export function addToCart(product, qty = 1) {
  console.log(qty);
  if (!product) return;
  const cart = readCart();
  //이미 담긴 상품 확인
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    //그 상품 수량 증가
    // existingItem.qty = existingItem.qty + qty;
    existingItem.qty += qty;
  } else {
    //새 상품 추가, 수량 1
    cart.push({
      id: product.id,
      title: product.title,
      brand: product.brand,
      thumb: product.thumbnail,
      qty: qty,
    });
  }
  writeCart(cart);
  updateCartCount();
}
