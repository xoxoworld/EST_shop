//상품 조회
async function fetchProducts() {
  try {
    const res = await fetch("./data/products.json");
    const data = await res.json();
    const products = data.products.slice(0, 12);
    // 빈 fragment를 생성
    const fragment = document.createDocumentFragment();
    
    // products 마다 할일
    products.forEach((product) => {
      // 빈 요소에 12개의 article를 생성
      const article = document.createElement("article");
      article.classList.add("product-card");
      
      const priceKRW = Math.round(product.price * 1300).toLocaleString();
      
      article.innerHTML = `
        <img src="${product.thumbnail}" alt="${product.title}">
        <div class="product-info">
          <h3>${product.title}</h3>
          <p>${product.description}</p>
          <div class="product-bottom">
            <strong>${priceKRW}원</strong>
            <button type="button" class="cart-add" aria-label="${product.title} 장바구니 담기"></button>
          </div>
        </div>
      `;
      
      fragment.appendChild(article);
    });
    
    // product-grid에 fragment의 내용을 html 태그로 생성
    const productGrid = document.querySelector(".product-grid");
    if (productGrid) {
      productGrid.appendChild(fragment);
    }
  } catch {
  } finally {
  }
}
fetchProducts();
