import { addToCart, updateCartCount } from "./utils/common.js";

let product = {};
let allProducts = [];
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
    allProducts = data.products;
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
  origin_price.textContent = `$${(data.price / (1 - data.discountPercentage / 100)).toFixed(2)}`;
  sale_price.textContent = `$${data.price}`;
  discount_rate.textContent = `${data.discountPercentage}%`;
  mainImage.setAttribute("src", data.images[0]);
  mainImage.setAttribute("alt", data.title);

  // 상품 상세 정보 탭 채우기
  details.innerHTML = `
    <div class="product-specifications">
      <h2 class="feature-title" id="feature-title">제품 특징 및 상세 정보</h2>
      <p class="product-description-full">${data.description}</p>
      
      <table class="spec-table">
        <tbody>
          <tr>
            <th>브랜드</th>
            <td>${data.brand || "자체제작"}</td>
            <th>카테고리</th>
            <td>${data.category}</td>
          </tr>
          <tr>
            <th>상품 번호 (SKU)</th>
            <td>${data.sku || "-"}</td>
            <th>재고 상태</th>
            <td>${data.availabilityStatus} (${data.stock}개 남음)</td>
          </tr>
          ${data.dimensions ? `
          <tr>
            <th>가로 크기</th>
            <td>${data.dimensions.width} cm</td>
            <th>세로 크기</th>
            <td>${data.dimensions.height} cm</td>
          </tr>
          <tr>
            <th>깊이</th>
            <td>${data.dimensions.depth} cm</td>
            <th>무게</th>
            <td>${data.weight} kg</td>
          </tr>
          ` : ""}
        </tbody>
      </table>
    </div>
    
    ${data.images && data.images.length > 1 ? `
    <div class="product-gallery-more">
      <h3>추가 이미지</h3>
      <div class="detail-gallery-grid">
        ${data.images.slice(1).map((img, idx) => `
          <div class="detail-gallery-item">
            <img src="${img}" alt="${data.title} 추가 이미지 ${idx + 1}" />
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}
  `;

  // 리뷰 및 배송 탭 채우기
  renderReviews(data.reviews || []);
  renderShipping(data);
}

// 리뷰 렌더링 함수
function renderReviews(reviews) {
  const reviewsContainer = document.querySelector("#reviews");
  if (!reviewsContainer) return;

  // 탭 메뉴의 리뷰 개수 업데이트
  const reviewsTabMenu = document.querySelector(".detail-tabs a[href='#reviews']");
  if (reviewsTabMenu) {
    reviewsTabMenu.textContent = `리뷰 (${reviews.length})`;
  }

  if (reviews.length === 0) {
    reviewsContainer.innerHTML = `
      <h2>리뷰 (0)</h2>
      <div class="empty-reviews">
        <p>등록된 리뷰가 없습니다.</p>
      </div>
    `;
    return;
  }

  // 평균 평점 계산
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = (totalRating / reviews.length).toFixed(1);

  // 리뷰 카드 생성
  const reviewCards = reviews.map(r => {
    const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
    const dateFormatted = new Date(r.date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
      <div class="review-card">
        <div class="review-header">
          <div class="review-author-info">
            <span class="reviewer-name">${r.reviewerName}</span>
            <span class="reviewer-email">(${r.reviewerEmail})</span>
          </div>
          <div class="review-meta">
            <span class="review-stars">${stars}</span>
            <span class="review-date">${dateFormatted}</span>
          </div>
        </div>
        <p class="review-comment">${r.comment}</p>
      </div>
    `;
  }).join("");

  reviewsContainer.innerHTML = `
    <h2>리뷰 (${reviews.length})</h2>
    <div class="review-summary">
      <div class="rating-large">${avgRating}</div>
      <div class="rating-stars-large">${"★".repeat(Math.round(avgRating))}${"☆".repeat(5 - Math.round(avgRating))}</div>
      <div class="rating-count">평균 평점 (${reviews.length}개의 리뷰)</div>
    </div>
    <div class="reviews-list">
      ${reviewCards}
    </div>
  `;
}

// 배송/교환/반품 정보 렌더링 함수
function renderShipping(data) {
  const shippingContainer = document.querySelector("#shipping");
  if (!shippingContainer) return;

  shippingContainer.innerHTML = `
    <h2>배송/교환/반품 안내</h2>
    <div class="shipping-info-grid">
      <div class="info-item">
        <h3>배송 정보</h3>
        <p><strong>배송 구분:</strong> 일반 택배 배송</p>
        <p><strong>배송 속도:</strong> ${data.shippingInformation || "영업일 기준 2~3일 소요"}</p>
        <p><strong>배송비:</strong> 무료 배송</p>
      </div>
      <div class="info-item">
        <h3>교환/반품 안내</h3>
        <p><strong>반품 기간:</strong> ${data.returnPolicy || "상품 수령 후 7일 이내 신청 가능"}</p>
        <p><strong>교환/반품 배송비:</strong> 고객 변심인 경우 왕복 배송비 5,000원 부담 (상품 하자/오배송의 경우 무료)</p>
        <p><strong>반품 불가 사유:</strong> 상품 포장이 훼손되었거나 사용 흔적이 있는 경우 반품이 제한될 수 있습니다.</p>
      </div>
      <div class="info-item">
        <h3>A/S 및 품질 보증</h3>
        <p><strong>품질 보증:</strong> ${data.warrantyInformation || "품질 보증 기준에 따름"}</p>
        <p><strong>A/S 접수:</strong> 고객센터를 통해 문의 접수해 주시기 바랍니다.</p>
      </div>
    </div>
  `;
}

// 상품 상세 탭 활성화 처리
const detail_tab_menus = document.querySelectorAll(".detail-tabs a");
const detail_tab_contents = document.querySelectorAll(".tab-content .detail-content");

detail_tab_menus.forEach(menu => {
  menu.addEventListener("click", e => {
    e.preventDefault();

    // 모든 탭 메뉴와 컨텐츠에서 active 제거
    detail_tab_menus.forEach(m => m.classList.remove("active"));
    detail_tab_contents.forEach(c => c.classList.remove("active"));

    // 현재 클릭한 탭 메뉴 active 추가
    menu.classList.add("active");

    // 매칭되는 컨텐츠 영역 active 추가
    const targetId = menu.getAttribute("href");
    const targetContent = document.querySelector(targetId);
    if (targetContent) {
      targetContent.classList.add("active");
    }
  });
});


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
            <strong>$${p.price}</strong>
            <button
              type="button"
              data-id="${p.id}"
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

// 추천 상품 장바구니 담기 처리
const recommendGrid = document.querySelector(".recommend-grid");
if (recommendGrid) {
  recommendGrid.addEventListener("click", e => {
    const btn = e.target.closest(".cart-add");
    if (!btn) return;

    const pid = Number(btn.dataset.id);
    const targetProd = allProducts.find(p => p.id === pid);
    if (targetProd) {
      addToCart(targetProd, 1);
    }
  });
}

