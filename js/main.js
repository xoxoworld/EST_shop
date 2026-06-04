const productGrid = document.querySelector(".product-grid");
const pager = document.querySelector(".pagination .pager");
const pagerPrevBtn = document.querySelector(".pagination .prev");
const pagerNextBtn = document.querySelector(".pagination .next");
const categoryFilter = document.querySelector("#category-filter");
const priceFilter = document.querySelector("#price-filter");
const brandFilter = document.querySelector("#brand-filter");

//pagination
const countPerPage = 12;
const pagerPerGroup = 5; //페이저 그룹당 몇개의 페이저 생성
let currentPage = 1;
let paginationCount = 0;
let currentGroup = 1;

//상품 조회
let products = [];
let filteredData = [];
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
                <button type="button" class="cart-add" aria-label="${p.title} 장바구니 담기"></button>
              </div>
            </div>
          </article>`,
  );

  productGrid.innerHTML = productHTML.join("");
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
      renderProducts();
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
  categoryLabel.forEach(label => {
    label.addEventListener("change", () => {
      let selectedCategory = label.value;
      const data = products.filter(p => p.category === selectedCategory);
      renderProducts(data);
    });
  });
}

function renderBrands() {
  const brands = [...new Set(products.map(p => p.brand))];
  const frag = document.createDocumentFragment();
  brands.forEach(b => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" name="brand" value="${b}" /> ${b}`;
    frag.appendChild(label);
  });
  brandFilter.appendChild(frag);
}
