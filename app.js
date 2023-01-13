// $(function () {
//   $(".basket_icon, .bi-x").click(function () {
//     $(".basket_modal").toggleClass("active");
//   });
// });
window.onload = () => {
  getBooks();
};
//MAIN DESCRIPTIONS
let bookList = [];
let basketList = [];
// TOASTR EFFECTS
toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: "toast-bottom-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};
const toggleModal = () => {
  const basketModalEl = document.querySelector(".basket_modal");
  basketModalEl.classList.toggle("active");
};
//FETCHING DATA FROM JSON
async function getBooks() {
  try {
    const response = await fetch("./products.json");
    bookList = await response.json();
  } catch (err) {
    console.log(err);
  }
}

//ADDING STAR COUNT
const createBookStars = (star) => {
  let starRate = "";
  for (let i = 1; i <= 5; i++) {
    if (Math.round(star) >= i) {
      starRate += `<i class="bi bi-star-fill active"></i>`;
    } else {
      starRate += `<i class="bi bi-star-fill"></i>`;
    }
  }
  return starRate;
};
//CREATING BOOK STORE CARDS
const createBookListCards = () => {
  const bookListAll = document.querySelector(".book_list");
  let bookListCards = "";
  bookList.forEach((book, index) => {
    bookListCards += `
        <div class="col-lg-5 col-md-12 col-sm-12  my-5">
          <div class="row book_card">
            <div class="col-6 ">
              <img
                class="img-fluid shadow"
                src="${book.imgSource}"
                alt=""
              />
            </div>
            <div class="col-6  d-flex justify-content-between flex-column">
              <div class="book_detail">
                <span class="author text-muted fs-5">${book.author}</span><br />
                <span class="fs-4">${book.name}</span><br />
                <div class="d-flex">
                <span class="book_star_rate">${createBookStars(
                  book.starRate
                )}</span><br />
                <span class="text-muted">${book.reviewCount}</span></div>
              </div>
              <p class="book_description text-muted">
               ${book.description}
              </p>
              <div class="go_basket" onclick="toggleModal()"><i class="bi bi-bag" ></i>Sepete Git</div>
              <div>
                <span class="price fs-4 me-2">${book.price}₺</span>
                ${
                  book.oldPrice
                    ? `<span class="text-muted fs-4 old_price">${book.oldPrice}₺</span>`
                    : ""
                }
                
              </div>
              <button class="btn btn_basket" onclick="addBookToBasket(${
                book.id
              })">SEPETE EKLE</button>
            </div>
          </div>
        </div>
    `;
  });
  bookListAll.innerHTML = bookListCards
    ? bookListCards
    : `    <li class="basket_items">No items here.</li>`;
};
//CONVERTING BOOKTYPES FROM TYPE
const BOOK_TYPES = {
  ALL: "TÜMÜ",
  NOVEL: "ROMAN",
  CHILDREN: "ÇOCUK",
  SELFIMPROVEMENT: "KİŞİSEL GELİŞİM",
  HISTORY: "TARİH",
  FINANCE: "FİNANS",
  SCIENCE: "BİLİM",
};
//CREATING MENU SIDE
const createBookTypes = () => {
  const menuSide = document.querySelector(".menu");
  let menuItems = "";
  let menuTypes = ["ALL"];
  bookList.forEach((book) => {
    if (menuTypes.findIndex((a) => a == book.type) == -1)
      menuTypes.push(book.type);
  });
  menuTypes.forEach((type, index) => {
    menuItems += `<li class="${
      index == 0 ? "active" : null
    }" onclick="categoryBooks(this)" data-type="${type}">${
      BOOK_TYPES[type]
    }</li>`;
  });
  menuSide.innerHTML = menuItems;
};
//LISTING BOOKS ACCORDING TO BOOK TYPE
const categoryBooks = (event) => {
  getBooks();
  document.querySelector(".menu .active").classList.remove("active");
  event.classList.add("active");
  let bookType = event.dataset.type;
  if (bookType !== "ALL") {
    bookList = bookList.filter((book) => book.type == bookType);
  }
  createBookListCards();
};
const listBasketItems = () => {
  localStorage.setItem("basketList", basketList);
  const basketListEl = document.querySelector(".basket_list");
  const basketCountEl = document.querySelector(".basket_count");
  const totalPriceEl = document.querySelector(".total_price");
  let basketListItems = "";
  let totalPrice = 0;
  let totalItem = 0;
  basketList.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
    totalItem += item.quantity;
    basketListItems += `
          <li class="basket_item mt-2">
            <img
              src="${item.product.imgSource}"
              width="100"
              height="100"
              alt=""
            />
            <div class="basket_item_info fs-5 ms-3">
              <h3 class="book_name">${item.product.name}</h3>
              <span class="book_price">${item.product.price}₺</span><br />
              <span class="book_remove text-muted" onclick="removeItemToBasket(${item.product.id})">Sepetten Çıkar</span>
            </div>
            <div class="book_count">
              <span class="decrease" onclick="decreaseItemToBasket(${item.product.id})">-</span><span class="my-5">${item.quantity}</span
              ><span class="increase" onclick="increaseItemToBasket(${item.product.id})">+</span>
            </div>
          </li>`;
  });
  basketListEl.innerHTML = basketListItems
    ? basketListItems
    : `<li class="basket__item">No items here.</li>`;
  totalPriceEl.innerHTML = "Total Price:" + totalPrice.toFixed(2) + "₺";
  basketCountEl.innerHTML = totalItem;
};
const addBookToBasket = (id) => {
  let findedBook = bookList.find((book) => book.id == id);
  if (findedBook) {
    const basketIndex = basketList.findIndex(
      (basket) => basket.product.id == id
    );
    if (basketIndex == -1) {
      let addedItem = { quantity: 1, product: findedBook };
      basketList.push(addedItem);
    } else {
      if (
        basketList[basketIndex].quantity < basketList[basketIndex].product.stock
      )
        basketList[basketIndex].quantity += 1;
      else {
        toastr.error("Sorry, we don't have enough stock.");
        return;
      }
    }
    listBasketItems();
    toastr.success("Book added to basket successfully.");
  }
};

const removeItemToBasket = (id) => {
  const findedIndex = basketList.findIndex((basket) => basket.product.id == id);
  if (findedIndex != -1) {
    basketList.splice(findedIndex, 1);
  }
  listBasketItems();
};
const decreaseItemToBasket = (id) => {
  const findedIndex = basketList.findIndex((basket) => basket.product.id == id);
  if (findedIndex != -1) {
    if (basketList[findedIndex].quantity != 1)
      basketList[findedIndex].quantity -= 1;
    else removeItemToBasket(id);
    listBasketItems();
  }
};
const increaseItemToBasket = (id) => {
  const findedIndex = basketList.findIndex((basket) => basket.product.id == id);
  if (findedIndex != -1) {
    if (
      basketList[findedIndex].quantity < basketList[findedIndex].product.stock
    )
      basketList[findedIndex].quantity += 1;
    else toastr.error("Sorry, we don't have enough stock.");
    listBasketItems();
  }
};
$(".user").click(function () {
  $(".form").addClass("login-active");
});
$(".form-cancel").click(function () {
  $(".form").removeClass("login-active");
});

$(".sign-up-btn").click(function () {
  $(".form").addClass("sign-up-active").removeClass("login-active");
});
$(".already-account").click(function () {
  $(".form").addClass("login-active").removeClass("sign-up-active");
});
$(".form-cancel").click(function () {
  $(".form").removeClass("sign-up-active");
});
setTimeout(() => {
  createBookListCards();
  createBookTypes();
}, 100);

// if (localStorage.getItem("basketList")) {
//   basketList = JSON.parse(localStorage(getItem("basketList")));
//   listBasketItems();
// }
