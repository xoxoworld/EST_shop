import { readCart, writeCart, updateCartCount } from "./utils/common.js";

// 로컬스토리지의 장바구니 정보를 조회하여 변수 cartItems에 할당
let cartItems = readCart();
let products = [];

// 클래스명 cart-layout의 내용의 뒤에 태그 생성
const cartLayout = document.querySelector(".cart-layout");
const cartList = cartLayout.querySelector(".cart-list");
const selectAllBtn = cartLayout.querySelector(".select-all");
const selectAllCheckbox = selectAllBtn?.querySelector(".check-box");
const deleteSelectedBtn = cartLayout.querySelector(".cart-list-header button");

const orderAmountEl = cartLayout.querySelector(".order-row:nth-of-type(1) strong");
const shippingFeeEl = cartLayout.querySelector(".order-row:nth-of-type(2) strong");
const totalAmountEl = cartLayout.querySelector(".order-total strong");
const cartCountText = document.querySelector(".cart-count-text");

async function initCart() {
  try {
    const res = await fetch("./data/products.json");
    if (!res.ok) throw new Error("상품 데이터를 불러오지 못했습니다.");
    const data = await res.json();
    products = data.products;
  } catch (error) {
    console.error("오류 발생:", error);
  }
  renderCartList();
  setupEvents();
  updateCartCount();
}

function renderCartList() {
  cartItems = readCart();
  
  // cart-list-header를 제외한 기존 상품 아이템 제거
  const header = cartList.querySelector(".cart-list-header");
  cartList.innerHTML = "";
  if (header) {
    cartList.appendChild(header);
  }

  // 상단 상품 개수 업데이트
  if (cartCountText) {
    cartCountText.textContent = `총 ${cartItems.length}개의 상품`;
  }

  if (cartItems.length === 0) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "empty-cart";
    emptyDiv.innerHTML = `
      <p>장바구니가 비어 있습니다.</p>
      <a href="./index.html" class="btn btn-primary">쇼핑하러 가기</a>
    `;
    cartList.appendChild(emptyDiv);

    if (orderAmountEl) orderAmountEl.textContent = "$0.00";
    if (shippingFeeEl) shippingFeeEl.textContent = "무료";
    if (totalAmountEl) totalAmountEl.textContent = "$0.00";
    
    if (selectAllCheckbox) {
      selectAllCheckbox.classList.remove("checked");
    }
    updateSelectAllText();
    return;
  }

  const frag = document.createDocumentFragment();

  cartItems.forEach(item => {
    const prod = products.find(p => p.id === item.id) || {};
    const price = prod.price || 0;
    const title = prod.title || item.title || "상품명 없음";
    const brand = prod.brand || item.brand || "자체제작";
    const thumb = prod.thumbnail || item.thumb || "";

    const article = document.createElement("article");
    article.className = "cart-item";
    article.dataset.id = item.id;
    article.innerHTML = `
      <span class="item-check"><span class="check-box checked" aria-hidden="true"></span></span>
      <div class="cart-thumb">
        <img src="${thumb}" alt="${title}" />
      </div>
      <div class="cart-item-info">
        <h2>${title}</h2>
        <p>${brand}</p>
        <strong>$${price.toFixed(2)}</strong>
      </div>
      <div class="quantity-box" aria-label="수량">
        <button type="button" class="btn-decrease" aria-label="수량 줄이기">-</button>
        <span>${item.qty}</span>
        <button type="button" class="btn-increase" aria-label="수량 늘리기">+</button>
      </div>
      <button type="button" class="remove-item" aria-label="${title} 삭제"></button>
    `;
    frag.appendChild(article);
  });

  // 클래스명 cart-layout의 내용(cart-list)의 뒤에 태그 생성
  cartList.appendChild(frag);

  if (selectAllCheckbox) {
    selectAllCheckbox.classList.add("checked");
  }

  updateSelectAllText();
  calculateTotals();
}

function calculateTotals() {
  let subtotal = 0;
  const items = cartList.querySelectorAll(".cart-item");
  
  items.forEach(itemDom => {
    const checkbox = itemDom.querySelector(".check-box");
    if (checkbox && checkbox.classList.contains("checked")) {
      const id = Number(itemDom.dataset.id);
      const cartItem = cartItems.find(item => item.id === id);
      const prod = products.find(p => p.id === id) || {};
      const price = prod.price || 0;
      if (cartItem) {
        subtotal += price * cartItem.qty;
      }
    }
  });

  const shipping = subtotal > 0 && subtotal < 50 ? 5.0 : 0.0;

  if (orderAmountEl) orderAmountEl.textContent = `$${subtotal.toFixed(2)}`;
  if (shippingFeeEl) shippingFeeEl.textContent = shipping > 0 ? `$${shipping.toFixed(2)}` : "무료";
  if (totalAmountEl) totalAmountEl.textContent = `$${(subtotal + shipping).toFixed(2)}`;
}

function updateSelectAllText() {
  const checkboxes = cartList.querySelectorAll(".cart-item .check-box");
  const checkedBoxes = cartList.querySelectorAll(".cart-item .check-box.checked");
  
  if (selectAllBtn) {
    selectAllBtn.childNodes[selectAllBtn.childNodes.length - 1].textContent = `전체선택 (${checkedBoxes.length}/${checkboxes.length})`;
  }

  if (selectAllCheckbox) {
    if (checkboxes.length > 0 && checkedBoxes.length === checkboxes.length) {
      selectAllCheckbox.classList.add("checked");
    } else {
      selectAllCheckbox.classList.remove("checked");
    }
  }
}

function setupEvents() {
  // 이벤트 위임
  cartList.addEventListener("click", e => {
    // 1. 체크박스 개별 선택 토글
    const cb = e.target.closest(".item-check .check-box");
    if (cb) {
      cb.classList.toggle("checked");
      updateSelectAllText();
      calculateTotals();
      return;
    }

    // 2. 수량 감소
    const dec = e.target.closest(".btn-decrease");
    if (dec) {
      const itemDom = dec.closest(".cart-item");
      const id = Number(itemDom.dataset.id);
      const cartItem = cartItems.find(item => item.id === id);
      if (cartItem && cartItem.qty > 1) {
        cartItem.qty--;
        writeCart(cartItems);
        itemDom.querySelector(".quantity-box span").textContent = cartItem.qty;
        calculateTotals();
        updateCartCount();
      }
      return;
    }

    // 3. 수량 증가
    const inc = e.target.closest(".btn-increase");
    if (inc) {
      const itemDom = inc.closest(".cart-item");
      const id = Number(itemDom.dataset.id);
      const cartItem = cartItems.find(item => item.id === id);
      if (cartItem) {
        cartItem.qty++;
        writeCart(cartItems);
        itemDom.querySelector(".quantity-box span").textContent = cartItem.qty;
        calculateTotals();
        updateCartCount();
      }
      return;
    }

    // 4. 개별 삭제
    const remove = e.target.closest(".remove-item");
    if (remove) {
      const itemDom = remove.closest(".cart-item");
      const id = Number(itemDom.dataset.id);
      cartItems = cartItems.filter(item => item.id !== id);
      writeCart(cartItems);
      renderCartList();
      updateCartCount();
      return;
    }
  });

  // 5. 전체 선택 클릭 토글
  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", e => {
      if (e.target.tagName === "BUTTON") return; // 선택삭제 버튼 클릭은 제외
      const isChecked = selectAllCheckbox.classList.contains("checked");
      const checkboxes = cartList.querySelectorAll(".cart-item .check-box");
      
      if (isChecked) {
        selectAllCheckbox.classList.remove("checked");
        checkboxes.forEach(cb => cb.classList.remove("checked"));
      } else {
        selectAllCheckbox.classList.add("checked");
        checkboxes.forEach(cb => cb.classList.add("checked"));
      }
      updateSelectAllText();
      calculateTotals();
    });
  }

  // 6. 선택 삭제 처리
  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener("click", () => {
      const checkedBoxes = cartList.querySelectorAll(".cart-item .check-box.checked");
      if (checkedBoxes.length === 0) {
        alert("선택된 상품이 없습니다.");
        return;
      }
      if (confirm("선택한 상품을 장바구니에서 삭제하시겠습니까?")) {
        const idsToRemove = Array.from(checkedBoxes).map(cb => Number(cb.closest(".cart-item").dataset.id));
        cartItems = cartItems.filter(item => !idsToRemove.includes(item.id));
        writeCart(cartItems);
        renderCartList();
        updateCartCount();
      }
    });
  }
}

initCart();
