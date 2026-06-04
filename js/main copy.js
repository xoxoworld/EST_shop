const productGrid = document.querySelector(".product-grid");

//상품 조회
async function fetchProducts() {
  try {
    const res = await fetch("./data/products.json");
    const data = await res.json();
    const products = data.products.slice(0, 12);
    console.log(products);
    const frag = document.createDocumentFragment(); //<></>
    products.forEach(p => {
      const article = document.createElement("article");
      article.className = "product-card";
      console.log("tag 생성");
      article.innerHTML = `
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80" alt="프리미엄 무선 헤드폰">
            <div class="product-info">
              <h3>프리미엄 무선 헤드폰</h3>
              <p>소니 WH-1000XM4</p>
              <div class="product-bottom">
                <strong>299,000원</strong>
                <button type="button" class="cart-add" aria-label="프리미엄 무선 헤드폰 장바구니 담기"></button>
              </div>
            </div>
          `;
      frag.appendChild(article);
    });
    console.log(frag);
    productGrid.append(frag);
  } catch {
  } finally {
  }
}
fetchProducts();
