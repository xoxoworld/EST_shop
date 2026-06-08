import { addToCart, updateCartCount } from "./utils/common.js";

const productGrid = document.querySelector(".product-grid");
const pager = document.querySelector(".pagination .pager");
const pagerPrevBtn = document.querySelector(".pagination .prev");
const pagerNextBtn = document.querySelector(".pagination .next");
const categoryFilter = document.querySelector("#category-filter");
const priceFilter = document.querySelector("#price-filter");
const brandFilter = document.querySelector("#brand-filter");
const filteredCount = document.querySelector(".products-tools > span");
const sortSelect = document.querySelector("#sort");

//pagination
const countPerPage = 12;
const pagerPerGroup = 5; //페이저 그룹당 몇개의 페이저 생성
let currentPage = 1;
let paginationCount = 0;
let currentGroup = 1;

let products = [];
let filteredData = [];

let selectedCategories = [];
let selectedBrands = [];
let selectedPrice = "";

//상품 조회
async function fetchProducts() {
  try {
    const res = await fetch("./data/products.json");
    const data = await res.json();
    products = data.products;
    filteredData = products;
    console.log(filteredData);
    //pagination 생성
    makePagination(filteredData.length);

    renderProducts(filteredData);
    renderCategories();
    renderBrands();
    renderPrices();
  } catch {
  } finally {
  }
}
fetchProducts();

function renderProducts(data) {
  const pagedData = paginate(data, currentPage);

  const productHTML = pagedData.map(
    p =>
      `<article class="product-card">
            <img src="${p.thumbnail}" alt="${p.title}">
            <div class="product-info">
              <h3><a href="detail.html?id=${p.id}">${p.title}</a></h3>
              <p>${p.brand}</p>
              <div class="product-bottom">
                <strong>${p.price}</strong>
                <button type="button" data-id="${p.id}" class="cart-add" aria-label="${p.title} 장바구니 담기"></button>
              </div>
            </div>
          </article>`,
  );

  productGrid.innerHTML = productHTML.join("");
  filteredCount.innerHTML = `총 ${data.length}개 상품`; //총 248개 상품
}

function makePagination(total) {
  paginationCount = Math.ceil(total / countPerPage); // 예: 9
  const pagerGroupCount = Math.ceil(paginationCount / pagerPerGroup); //2

  // 현재 그룹의 시작 페이지
  const startPage = (currentGroup - 1) * pagerPerGroup + 1;

  // 현재 그룹의 마지막 페이지
  const endPage = Math.min(startPage + pagerPerGroup - 1, paginationCount);

  let pagerHTML = "";
  for (let i = startPage; i <= endPage; i++) {
    pagerHTML += `<a href="#" class="${i === currentPage ? "active" : ""}">${i}</a>`;
  }
  pager.innerHTML = pagerHTML;

  if (currentGroup === 1) {
    pagerPrevBtn.classList.add("disabled");
  } else {
    pagerPrevBtn.classList.remove("disabled");
  }
  if (currentGroup === pagerGroupCount) {
    pagerNextBtn.classList.add("disabled");
  } else {
    pagerNextBtn.classList.remove("disabled");
  }
  const pagerBtns = pager.querySelectorAll("a");
  pagerBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      if (currentPage === Number(btn.textContent)) return;

      currentPage = Number(btn.textContent);
      renderProducts(filteredData);
      pagerBtns.forEach(b => {
        b.classList.remove("active");
      });
      btn.classList.add("active");
    });
  });
}

function paginate(data, page) {
  const start = (page - 1) * countPerPage; //page 1 0, page 2 12
  const end = start + countPerPage;
  return data.slice(start, end);
}

pagerPrevBtn.addEventListener("click", e => {
  e.preventDefault();
  moveGroup(-1);
});
pagerNextBtn.addEventListener("click", e => {
  e.preventDefault();
  moveGroup(1);
});
function moveGroup(direction) {
  currentGroup += direction;
  currentPage = (currentGroup - 1) * pagerPerGroup + 1; //1
  makePagination(filteredData.length);
  renderProducts(filteredData);
}

//카테고리 생성
function renderCategories() {
  const categories = [...new Set(products.map(p => p.category))];
  const frag = document.createDocumentFragment();
  categories.forEach(c => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" name="category" value="${c}" /> ${c}`;
    frag.appendChild(label);
  });
  categoryFilter.appendChild(frag);
  const categoryLabel = categoryFilter.querySelectorAll("input");
  console.log(categoryLabel);
  categoryLabel.forEach(label => {
    label.addEventListener("change", () => {
      //all 체크시 나머지 해제
      //대상.checked   체크 여부 반환
      //대상.checked = true, false
      if (label.checked && label.value === "all") {
        //모든 input 체크 해제
        categoryLabel.forEach(l => {
          if (l.value !== "all") {
            l.checked = false;
          }
        });
      } else {
        //일반 카테고리 체크시 all 해제
        categoryLabel.forEach(l => {
          if (l.value === "all") {
            l.checked = false;
          }
        });
        selectedCategories = [...categoryLabel]
          .filter(input => input.checked && input.value !== "all")
          .map(input => input.value);
      }
      applyFilter();
    });
  });
}

//브랜드 필터 생성 + 필터링
function renderBrands() {
  const brands = [...new Set(products.map(p => p.brand))];
  const frag = document.createDocumentFragment();
  brands.forEach(b => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" name="brand" value="${b}" /> ${b}`;
    frag.appendChild(label);
  });
  brandFilter.appendChild(frag);

  const brandInputs = brandFilter.querySelectorAll("input");
  brandInputs.forEach(input => {
    input.addEventListener("change", () => {
      selectedBrands = [...brandInputs].filter(input => input.checked).map(input => input.value); //['Essence','Chanel'..]

      applyFilter();
    });
  });
}

//가격 필터 생성
function renderPrices() {
  const priceHTML = `
  <label><input type="radio" name="price" value="low" /> 10$ 이하</label>
  <label><input type="radio" name="price" value="middle" /> 10$ ~ 100$</label>
  <label><input type="radio" name="price" value="high" /> 100% 이상</label>
  `;
  priceFilter.innerHTML += priceHTML;
  const priceInputs = priceFilter.querySelectorAll("input");
  priceInputs.forEach(input => {
    input.addEventListener("change", () => {
      selectedPrice = input.value;
      applyFilter();
    });
  });
}

//필터 적용 함수
function applyFilter() {
  let result = [...products];

  //카테고리
  if (selectedCategories.length > 0) {
    result = result.filter(p => selectedCategories.includes(p.category));
  }

  //브랜드
  if (selectedBrands.length > 0) {
    result = result.filter(p => selectedBrands.includes(p.brand));
  }

  //가격
  if (selectedPrice === "low") {
    result = result.filter(p => p.price < 10);
  }
  if (selectedPrice === "middle") {
    result = result.filter(p => p.price >= 10 && p.price <= 100);
  }
  if (selectedPrice === "high") {
    result = result.filter(p => p.price > 100);
  }

  currentPage = 1;
  currentGroup = 1;

  filteredData = result;

  renderProducts(result);
  makePagination(result.length);
}

sortSelect.addEventListener("change", () => {
  const selectedValue = sortSelect.value;
  console.log(selectedValue); //인기순, 최신순, 낮은 가격순, 높은 가격순
  switch (selectedValue) {
    case "인기순":
      filteredData.sort((a, b) => {
        return b.rating - a.rating;
      });
      break;

    case "최신순":
      filteredData.sort((a, b) => {
        return new Date(b.meta.createdAt) - new Date(a.meta.createdAt);
      });
      break;

    case "낮은 가격순":
      filteredData.sort((a, b) => {
        return a.price - b.price;
      });
      break;

    case "높은 가격순":
      filteredData.sort((a, b) => {
        return b.price - a.price;
      });
      break;
  }

  currentPage = 1;
  currentGroup = 1;
  renderProducts(filteredData);
  makePagination(filteredData.length);
});

//장바구니에 추가
productGrid.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const pid = Number(btn.dataset.id);
  const product = products.find(p => p.id === pid);
  addToCart(product);
});

updateCartCount();
