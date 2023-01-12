// $(function () {
//   $(".basket_icon, .bi-x").click(function () {
//     $(".basket_modal").toggleClass("active");
//   });
// });

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
getBooks();
//ADDING STAR COUNT
const createBookStars = (starRate) => {
  let starRateHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (Math.round(starRate) >= i) {
      starRateHtml += `<i class="bi bi-star-fill active"></i>`;
    } else {
      starRateHtml += `<i class="bi bi-star-fill"></i>`;
    }
  }
  return starRateHtml;
};
//CREATING BOOK STORE CARDS
const createBookItemsHtml = () => {
  const bookListEl = document.querySelector(".book_list");
  let bookListHtml = "";
  bookList.forEach((book, index) => {
    bookListHtml += `
        <div class="col-5 ${index % 2 == 0 && "offset-2"} my-5">
          <div class="row book_card">
            <div class="col-6">
              <img
                class="img-fluid shadow"
                src="${book.imgSource}"
                alt=""
              />
            </div>
            <div class="col-6 d-flex justify-content-between flex-column">
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
  bookListEl.innerHTML = bookListHtml
    ? bookListHtml
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
const createBookTypesHtml = () => {
  const filterEl = document.querySelector(".menu");
  let filterHtml = "";
  let filterTypes = ["ALL"];
  bookList.forEach((book) => {
    if (filterTypes.findIndex((a) => a == book.type) == -1)
      filterTypes.push(book.type);
  });
  filterTypes.forEach((type, index) => {
    filterHtml += `<li class="${
      index == 0 ? "active" : null
    }" onclick="filterBooks(this)" data-type="${type}">${
      BOOK_TYPES[type]
    }</li>`;
  });
  filterEl.innerHTML = filterHtml;
};
//LISTING BOOKS ACCORDING TO BOOK TYPE
const filterBooks = (event) => {
  getBooks();
  document.querySelector(".menu .active").classList.remove("active");
  event.classList.add("active");
  let bookType = event.dataset.type;

  if (bookType !== "ALL") {
    bookList = bookList.filter((book) => book.type == bookType);
  }
  createBookItemsHtml();
};
const listBasketItems = () => {
  localStorage.setItem("basketList", basketList);
  const basketListEl = document.querySelector(".basket_list");
  const basketCountEl = document.querySelector(".basket_count");

  const totalPriceEl = document.querySelector(".total_price");
  let basketListHtml = "";
  let totalPrice = 0;
  let totalItem = 0;
  basketList.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
    totalItem += item.quantity;
    basketListHtml += `
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
  basketListEl.innerHTML = basketListHtml
    ? basketListHtml
    : `<li class="basket__item">No items here.</li>`;
  totalPriceEl.innerHTML = "Total Price:" + totalPrice.toFixed(2) + "₺";
  basketCountEl.innerHTML = totalItem;
};
const addBookToBasket = (bookId) => {
  let findedBook = bookList.find((book) => book.id == bookId);
  if (findedBook) {
    const basketAlreadyIndex = basketList.findIndex(
      (basket) => basket.product.id == bookId
    );
    if (basketAlreadyIndex == -1) {
      let addedItem = { quantity: 1, product: findedBook };
      basketList.push(addedItem);
    } else {
      if (
        basketList[basketAlreadyIndex].quantity <
        basketList[basketAlreadyIndex].product.stock
      )
        basketList[basketAlreadyIndex].quantity += 1;
      else {
        toastr.error("Sorry, we don't have enough stock.");
        return;
      }
    }
    listBasketItems();
    toastr.success("Book added to basket successfully.");
  }
};

const removeItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    basketList.splice(findedIndex, 1);
  }
  listBasketItems();
};
const decreaseItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    if (basketList[findedIndex].quantity != 1)
      basketList[findedIndex].quantity -= 1;
    else removeItemToBasket(bookId);
    listBasketItems();
  }
};
const increaseItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
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
  createBookItemsHtml();
  createBookTypesHtml();
}, 100);

// if (localStorage.getItem("basketList")) {
//   basketList = JSON.parse(localStorage(getItem("basketList")));
//   listBasketItems();
// }
