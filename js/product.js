import { addToCart, updateCartCount } from "./utils/common.js";

let product = {};
updateCartCount();
export async function fetchProduct() {
  //console.log(location.href); //http://127.0.0.1:5500/detail.html?id=3
  //console.log(location.search); //?id=3
  let params = new URLSearchParams(location.search);
  //console.log(params.get("id")); // 3
  const productID = params.get("id"); //3
  //console.log(typeof productID);  //string
  if (!productID) {
    alert("잘못된 접근입니다. 홈으로 이동하겠습니다.");
    location.href = "./index.html";
  }
  try {
    const res = await fetch("./data/products.json");
    if (!res.ok) throw new Error("로딩에 실패했습니다.");
    const data = await res.json();
    console.log(data);
    //조회된 상품정보에서 상품의 id가 productID와 일치하는 요소를 변수 product 할당
    product = data.products.find(p => p.id === Number(productID));
    if (!product) {
      alert("존재하지 않는 상품입니다.");
      location.href = "./index.html";
    }
    createContent(product);
    createRecommendLists(data.products, product.category, Number(productID));
  } catch (e) {
    console.log(e);
  } finally {
    console.log("조회를 종료했습니다.");
    console.log(product);
  }
}

function createContent(data) {
  const title = document.querySelector("#product-title"),
    category = document.querySelector(".product-category"),
    desc = document.querySelector(".product-description"),
    origin_price = document.querySelector(".origin-price"),
    sale_price = document.querySelector(".sale-price"),
    discount_rate = document.querySelector(".discount-rate"),
    mainImage = document.querySelector(".main-image img"),
    details = document.querySelector("#product-info");

  title.textContent = data.title;
  category.textContent = data.category;
  desc.textContent = data.description;
  origin_price.textContent = (data.price / (1 - data.discountPercentage / 100)).toFixed(2);
  sale_price.textContent = data.price;
  discount_rate.textContent = data.discountPercentage;
  mainImage.setAttribute("src", data.images[0]);
  mainImage.setAttribute("alt", data.title);
  details.textContent = data.description;
}

//상품 상세 tab
const detail_tab_menus = "";
const detail_tab_contents = "";

function createRecommendLists(all, category, id) {
  const recommendList = all.filter(p => p.category === category && p.id !== id).slice(0, 4);
  const productHTML = recommendList.map(
    p => `
      <article class="product-card">
        <img
          src="${p.thumbnail}"
          alt="${p.title}"
        />
        <div class="product-info">
          <h3><a href="detail.html?id=${p.id}">${p.title}</a></h3>
          <p>${p.category}</p>
          <div class="product-bottom">
            <strong>${p.price}</strong>
            <button
              type="button"
              class="cart-add"
              aria-label="${p.title} 장바구니 담기"
            ></button>
          </div>
        </div>
      </article>
    `,
  );

  document.querySelector(".recommend-grid").innerHTML = productHTML.join("");
}

fetchProduct();

//상품 수량 변경하기
const quantity_control = document.querySelector(".quantity-control");
const quantity = document.querySelector("#quantity");

quantity_control.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  let currentQty = Number(quantity.value);
  if (btn.textContent === "-") {
    if (currentQty > 1) {
      currentQty--;
    }
  } else {
    currentQty++;
  }
  quantity.value = currentQty;
});

//장바구니에 담기
const addcart = document.querySelector("#addcart");
addcart.addEventListener("click", () => {
  addToCart(product, Number(quantity.value));
});
