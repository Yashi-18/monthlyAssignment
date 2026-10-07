
// URL API DummyJSON yang akan digunakan untuk mengambil semua recipe.
const API = 'https://dummyjson.com/recipes?limit=0';

// KEY digunakan sebagai nama penyimpanan favorite di LocalStorage.
const KEY = 'recipeFinderFavorites';

// Tanda $ ini hanya shortcut agar kita tidak perlu
// menulis document.getElementById() berkali-kali.
// Contoh:
// $('search') sama dengan: document.getElementById('search')
const $ = id => document.getElementById(id);

// Array kosong untuk menyimpan semua data recipe
// yang nanti didapat dari API.
let recipes = [];

// Mengambil data favorite dari LocalStorage.
// localStorage.getItem(KEY) digunakan untuk mengambil data yang sebelumnya disimpan.
// JSON.parse() digunakan untuk mengubah data JSON/string dari LocalStorage
// kembali menjadi array/object JavaScript.
// || [] = artinya kalau belum ada data favorite, gunakan array kosong.
let favorites = JSON.parse(localStorage.getItem(KEY)) || [];

// Variabel ini digunakan untuk mengetahui apakah user
// sedang berada di halaman semua recipe atau halaman favorite.
// false = sedang melihat semua recipe.
// true = sedang melihat favorite.
let favoritePage = false;

// Function ini digunakan untuk mengambil data recipe dari DummyJSON API.
async function loadRecipes() {

  // Menampilkan loading sebelum proses pengambilan data dimulai.
  showLoading();

  try {

    // fetch() digunakan untuk meminta/mengambil data dari API.
    // await berarti program menunggu sampai fetch selesai.
    const res = await fetch(API);

    // Mengecek apakah response dari API berhasil.
    // res.ok bernilai true jika request berhasil.
    // Tanda ! berarti kebalikannya.
    //
    // Jadi kalau !res.ok berarti API mengalami masalah.
    if (!res.ok) {
      throw new Error('API tidak merespons dengan benar.');
    }


    // Mengubah response dari API menjadi data JSON
    // yang bisa digunakan oleh JavaScript.
    const data = await res.json();

    // API mengembalikan object yang memiliki property "recipes".
    // Data recipe tersebut dimasukkan ke array recipes.
    recipes = data.recipes;

    // Membuat pilihan filter berdasarkan data recipe yang sudah berhasil diambil.
    buildFilters();

    // Menampilkan semua recipe ke halaman.
    render(recipes);

    // Memperbarui jumlah favorite yang tampil di navbar.
    updateCount();

  } catch (err) {

    // Kalau terjadi error saat mengambil API, program akan masuk ke bagian catch.
    // err.message berisi pesan error.
    showError(err.message);
  }
}

// Function ini digunakan untuk membuat pilihan:
// - kategori/tag
// - cuisine
// - meal type
// Data filter diambil langsung dari recipe API.
function buildFilters() {

  // flatMap() mengambil semua tags dari setiap recipe.
  //
  // Set digunakan untuk menghilangkan data yang sama/duplikat.
  //
  // ... digunakan untuk mengubah Set kembali menjadi array.
  //
  // sort() digunakan untuk mengurutkan data.
  const tags = [...new Set(
    recipes.flatMap(r => r.tags)
  )].sort();

  // map() mengambil nilai cuisine dari setiap recipe.
  //
  // Set menghilangkan cuisine yang duplikat.
  //
  // sort() mengurutkannya.
  const cuisines = [...new Set(
    recipes.map(r => r.cuisine)
  )].sort();

  // Sama seperti tags,
  // tetapi yang diambil adalah mealType.
  const meals = [...new Set(
    recipes.flatMap(r => r.mealType)
  )].sort();

  // Memasukkan data tags ke dropdown dengan ID "tag".
  fill(
    $('tag'),
    tags,
    'Semua Kategori'
  );

  // Memasukkan data cuisine ke dropdown dengan ID "cuisine".
  fill(
    $('cuisine'),
    cuisines,
    'Semua Cuisine'
  );

  // Memasukkan data meal type ke dropdown dengan ID "meal".
  fill(
    $('meal'),
    meals,
    'Semua Meal'
  );
}

// Function ini menerima:
// select = element dropdown
// items = data yang akan dimasukkan
// first = pilihan pertama/default
function fill(select, items, first) {

  // innerHTML digunakan untuk membuat isi dropdown menggunakan HTML yang dibuat dari JavaScript.
  // map() membuat <option> untuk setiap item.
  // join('') menggabungkan semua option menjadi satu string HTML.
  select.innerHTML =
    `<option value="all">${first}</option>` +
    items
      .map(x => `<option value="${x}">${x}</option>`)
      .join('');
}

// Function ini menghitung total waktu recipe.
// Total waktu = waktu persiapan + waktu memasak.
function totalTime(r) {

  return r.prepTimeMinutes + r.cookTimeMinutes;
}

// Function ini menentukan recipe mana yang boleh ditampilkan
// berdasarkan search, filter, dan sorting.
function visible() {

  // Mengambil isi search dari input dengan ID "search".
  // toLowerCase() membuat huruf menjadi kecil supaya pencarian tidak membedakan huruf besar dan kecil.
  // trim() menghapus spasi di awal dan akhir.
  const q = $('search').value
    .toLowerCase()
    .trim();

  // filter() digunakan untuk memilih recipe
  // yang memenuhi kondisi pencarian dan filter.
  let list = recipes.filter(r => {

    // Nama recipe dan cuisine digabung menjadi satu string.
    // Kemudian diubah menjadi lowercase.
    // includes() mengecek apakah kata yang dicari
    // terdapat di dalam nama atau cuisine.
    const search =
      (r.name + ' ' + r.cuisine)
        .toLowerCase()
        .includes(q);

    // Recipe hanya akan masuk ke list jika:
    // 1. Sesuai search
    // 2. Sesuai tag
    // 3. Sesuai cuisine
    // 4. Sesuai meal type
    return search &&

      // Kalau tag = all, berarti semua kategori diperbolehkan.
      // Kalau bukan all, recipe harus mempunyai tag yang dipilih.
      (
        $('tag').value === 'all' ||
        r.tags.includes($('tag').value)
      ) &&

      // Kalau cuisine = all, semua cuisine diperbolehkan.
      // Kalau tidak, cuisine recipe harus sama dengan pilihan user.
      (
        $('cuisine').value === 'all' ||
        r.cuisine === $('cuisine').value
      ) &&

      // Kalau meal = all, semua meal diperbolehkan.
      // Kalau tidak, mealType recipe harus mempunyai pilihan user.
      (
        $('meal').value === 'all' ||
        r.mealType.includes($('meal').value)
      );

  });

  // Mengambil pilihan sorting dari dropdown.
  const s = $('sort').value;

  // Sorting berdasarkan nama A-Z.
  // localeCompare() digunakan untuk membandingkandua string/nama.
  if (s === 'name-asc') {
    list.sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }

  // Sorting berdasarkan nama Z-A.
  if (s === 'name-desc') {
    list.sort(
      (a, b) => b.name.localeCompare(a.name)
    );
  }

  // Sorting berdasarkan rating tertinggi.
  // b.rating - a.rating
  // membuat angka yang lebih besar berada di atas.
  if (s === 'rating') {
    list.sort(
      (a, b) => b.rating - a.rating
    );
  }

  // Sorting berdasarkan waktu paling cepat.
  // totalTime() menghitung waktu persiapan + memasak.
  if (s === 'time') {
    list.sort(
      (a, b) => totalTime(a) - totalTime(b)
    );
  }

  // Mengembalikan hasil akhir yang sudah
  // melalui search, filter, dan sorting.
  return list;
}

// Function ini membuat tampilan satu recipe card.
function card(r) {

  // some() digunakan untuk mengecek apakah recipe ini sudah ada di dalam array favorites.
  // Kalau ada, saved = true.
  // Kalau tidak ada, saved = false.
  const saved = favorites.some(
    x => x.id === r.id
  );

  // Template literal digunakan untuk membuat HTML.
  // Data recipe dimasukkan menggunakan ${...}.
  return `
    <article class="card">

      <div class="pic">

        <!-- Menampilkan gambar recipe -->
        <img
          src="${r.image}"
          alt="${r.name}"
          loading="lazy"
        >

        <!-- Tombol favorite -->
        <button
          class="heart ${saved ? 'on' : ''}"
          data-fav="${r.id}"
        >
          ${saved ? '♥' : '♡'}
        </button>

      </div>


      <div class="body">

        <!-- Menampilkan cuisine dan rating -->
        <div class="chips">

          <span class="chip">
            ${r.cuisine}
          </span>

          <span class="chip">
            ★ ${r.rating}
          </span>

        </div>


        <!-- Nama recipe -->
        <h3 class="title">
          ${r.name}
        </h3>


        <!-- Informasi waktu dan porsi -->
        <div class="meta">

          <span>
            ◷ ${totalTime(r)} menit
          </span>

          <span>
            ♙ ${r.servings} porsi
          </span>

        </div>


        <!-- Tombol untuk membuka detail recipe -->
        <button
          class="detail"
          data-detail="${r.id}"
        >
          Lihat Detail
        </button>

      </div>

    </article>
  `;
}

// Function ini menerima list recipe lalu menampilkannya ke halaman.
function render(list) {

  // Menyembunyikan loading dan error.
  $('loading').hidden = true;
  $('error').hidden = true;

  // Kalau hasil pencarian/filter kosong...
  if (!list.length) {

    // Kosongkan isi grid.
    $('grid').innerHTML = '';

    // Sembunyikan grid.
    $('grid').hidden = true;

    // Tampilkan pesan kosong.
    $('empty').hidden = false;

    // Ubah teks hasil.
    $('result').textContent =
      'Tidak ada resep yang cocok.';

    // Menghentikan function di sini.
    return;
  }

  // Kalau ada data, sembunyikan pesan kosong.
  $('empty').hidden = true;

  // Tampilkan grid recipe.
  $('grid').hidden = false;

  // map(card) menjalankan function card() untuk setiap recipe.
  // join('') menggabungkan semua HTML card.
  // innerHTML memasukkan hasilnya ke halaman.
  $('grid').innerHTML =
    list.map(card).join('');

  // Menampilkan jumlah recipe yang sedang ditampilkan.
  $('result').textContent =
    `Menampilkan ${list.length} dari ${recipes.length} resep`;
}

// Function ini adalah penghubung antara
// filter/search/sort dengan render().
function apply() {

  // Kalau sedang berada di halaman favorite,
  // jangan menjalankan render recipe biasa.
  if (!favoritePage) {

    // visible() mengambil data yang sudah difilter.
    // Kemudian hasilnya dikirim ke render().
    render(visible());
  }
}

// Saat form search di-submit...
$('searchForm').addEventListener(
  'submit',
  e => {

    // Mencegah form melakukan refresh halaman.
    e.preventDefault();

    // Menampilkan hasil search.
    apply();
  }
);

// Saat user mengetik di search,
// apply() langsung dijalankan.
$('search').addEventListener(
  'input',
  apply
);

// Kalau dropdown tag berubah,
// jalankan apply().
$('tag').addEventListener(
  'change',
  apply
);

// Kalau dropdown cuisine berubah.
$('cuisine').addEventListener(
  'change',
  apply
);

// Kalau dropdown meal berubah.
$('meal').addEventListener(
  'change',
  apply
);

// Kalau sorting berubah.
$('sort').addEventListener(
  'change',
  apply
);

// Saat tombol reset diklik...
$('reset').addEventListener(
  'click',
  () => {

    // Kosongkan search.
    $('search').value = '';

    // Kembalikan tag ke pilihan awal.
    $('tag').value = 'all';

    // Kembalikan cuisine ke pilihan awal.
    $('cuisine').value = 'all';

    // Kembalikan meal ke pilihan awal.
    $('meal').value = 'all';

    // Kembalikan sorting ke default.
    $('sort').value = 'default';

    // Tampilkan kembali semua recipe.
    render(recipes);
  }
);

// Function ini digunakan untuk menambah
// atau menghapus recipe dari favorite.
function toggleFavorite(id) {

  // Mencari recipe berdasarkan ID.
  // find() mengembalikan satu recipe yang ID-nya sama.
  const r = recipes.find(
    x => x.id === id
  );

  // Kalau recipe tidak ditemukan, hentikan function.
  if (!r) return;

  // Mengecek apakah recipe sudah ada di favorite.
  if (
    favorites.some(x => x.id === id)
  ) {

    // Kalau sudah ada, hapus recipe tersebut menggunakan filter().
    // Kita menyimpan semua recipe KECUALI recipe dengan ID tersebut.
    favorites = favorites.filter(
      x => x.id !== id
    );

  } else {

    // Kalau belum ada,
    // masukkan recipe ke array favorite.
    favorites.push(r);
  }

  // Simpan array favorite ke LocalStorage.
  // JSON.stringify() mengubah array JavaScript
  // menjadi JSON/string.
  localStorage.setItem(
    KEY,
    JSON.stringify(favorites)
  );

  // Update angka favorite di navbar.
  updateCount();

  // Kalau sedang berada di halaman favorite, render ulang halaman favorite.
  if (favoritePage) {

    renderFavorites();

  } else {

    // Kalau tidak, render kembali recipe biasa.
    render(visible());
  }
}

// Menampilkan jumlah favorite ke HTML.
function updateCount() {

  // favorites.length menunjukkan jumlah data yang ada di array favorites.
  $('favoriteCount').textContent =
    favorites.length;
}

// Function ini menangani klik pada tombol
// favorite dan tombol detail.
function clickCards(e) {

  // Mencari apakah element yang diklik
  // mempunyai data-fav.
  const fav =
    e.target.closest('[data-fav]');

  // Mencari apakah element yang diklik mempunyai data-detail.
  const detail =
    e.target.closest('[data-detail]');

  // Kalau yang diklik adalah tombol favorite, ambil ID-nya lalu jalankan toggleFavorite().
  if (fav) {
    // dataset.fav mengambil nilai dari data-fav="..."
    // Number() mengubah string menjadi number.
    toggleFavorite(
      Number(fav.dataset.fav)
    );
  }

  // Kalau yang diklik adalah tombol detail, buka detail recipe.
  if (detail) {

    toggleDetail:
    showDetail(
      Number(detail.dataset.detail)
    );
  }
}

// Daripada memberikan event listener ke setiap tombol satu-satu,
// kita pasang satu listener ke parent grid.
// Ini disebut event delegation.
$('grid').addEventListener(
  'click',
  clickCards
);

// Hal yang sama dilakukan untuk grid favorite.
$('favGrid').addEventListener(
  'click',
  clickCards
);

// Function ini digunakan untuk menampilkan detail lengkap sebuah recipe.
function showDetail(id) {

  // Cari recipe berdasarkan ID.
  const r = recipes.find(
    x => x.id === id
  );

  // Kalau recipe tidak ditemukan, hentikan function.
  if (!r) return;

  // Mengecek apakah recipe sudah menjadi favorite.
  const saved = favorites.some(
    x => x.id === id
  );

  // Membuat isi popup menggunakan innerHTML.
  $('modalBody').innerHTML = `

    <div class="modal-grid">

      <div>

        <!-- Gambar recipe -->
        <img
          class="modal-img"
          src="${r.image}"
          alt="${r.name}"
        >

      </div>


      <div class="modal-copy">

        <!-- Informasi singkat -->
        <div class="chips">

          <span class="chip">
            ${r.cuisine}
          </span>

          <span class="chip">
            ★ ${r.rating}
          </span>

          <span class="chip">
            ${r.difficulty}
          </span>

        </div>


        <!-- Nama recipe -->
        <h2>${r.name}</h2>


        <!-- Meal type -->
        <p class="intro">
          Cocok untuk ${r.mealType.join(', ')}.
          Yuk lihat bahan dan cara membuatnya.
        </p>


        <!-- Informasi waktu dan porsi -->
        <div class="stats">

          <div class="stat">
            <small>Persiapan</small>
            <strong>
              ${r.prepTimeMinutes} menit
            </strong>
          </div>

          <div class="stat">
            <small>Memasak</small>
            <strong>
              ${r.cookTimeMinutes} menit
            </strong>
          </div>

          <div class="stat">
            <small>Total</small>
            <strong>
              ${totalTime(r)} menit
            </strong>
          </div>

          <div class="stat">
            <small>Porsi</small>
            <strong>
              ${r.servings} orang
            </strong>
          </div>

        </div>


        <!-- Bahan-bahan -->
        <div class="modal-section">

          <h3>🥕 Bahan-bahan</h3>

          <ul>

            ${
              r.ingredients
                .map(x => `<li>${x}</li>`)
                .join('')
            }

          </ul>

        </div>


        <!-- Cara membuat -->
        <div class="modal-section">

          <h3>👨‍🍳 Cara membuat</h3>

          <ol>

            ${
              r.instructions
                .map(x => `<li>${x}</li>`)
                .join('')
            }

          </ol>

        </div>


        <!-- Tombol favorite di popup -->
        <button
          class="modal-fav"
          data-modal-fav="${r.id}"
        >
          ${
            saved
              ? '♥ Hapus dari Favorit'
              : '♡ Simpan ke Favorit'
          }
        </button>

      </div>

    </div>
  `;


  // Membuka popup/dialog.
  $('modal').showModal();
}

// Event listener untuk tombol favorite
// yang berada di dalam popup.
$('modalBody').addEventListener(
  'click',
  e => {

    // Cari element yang mempunyai data-modal-fav.
    const b =
      e.target.closest('[data-modal-fav]');

    // Kalau tombol ditemukan...
    if (b) {

      // Ambil ID dari data-modal-fav.
      const id =
        Number(b.dataset.modalFav);

      // Tambahkan atau hapus favorite.
      toggleFavorite(id);

      // Tampilkan kembali detail supaya teks tombol berubah.
      showDetail(id);
    }
  }
);
// Tombol close digunakan untuk menutup modal.
$('close').addEventListener(
  'click',
  () => $('modal').close()
);

// Kalau user klik area luar modal, modal juga akan ditutup.
$('modal').addEventListener(
  'click',
  e => {

    if (e.target === $('modal')) {
      $('modal').close();
    }

  }
);

function showFavorites() {

  // Menandakan bahwa sekarang kita berada di halaman favorite.
  favoritePage = true;

  // Sembunyikan halaman semua recipe.
  $('recipes').hidden = true;

  // Tampilkan halaman favorite.
  $('favorites').hidden = false;

  // Tampilkan recipe favorite.
  renderFavorites();

  // Scroll otomatis menuju bagian favorite.
  $('favorites').scrollIntoView({
    behavior: 'smooth'
  });
}

function renderFavorites() {
  // Kosongkan grid favorite terlebih dahulu.
  $('favGrid').innerHTML = '';

  // Kalau tidak ada favorite, grid disembunyikan.
  // !favorites.length bernilai true kalau array kosong.
  $('favGrid').hidden = !favorites.length;

  // Kalau ada favorite, pesan kosong disembunyikan.
  // !!favorites.length mengubah jumlah menjadi boolean.
  $('favEmpty').hidden = !!favorites.length;

  // Kalau favorite tidak kosong...
  if (favorites.length) {

    // Buat card dari setiap favorite.
    $('favGrid').innerHTML =
      favorites.map(card).join('');
  }
}

function showAll() {

  // Menandakan kita sudah tidak berada di halaman favorite.
  favoritePage = false;

  // Sembunyikan halaman favorite.
  $('favorites').hidden = true;

  // Tampilkan halaman recipe.
  $('recipes').hidden = false;

  // Tampilkan kembali hasil search/filter/sort
  // yang sedang aktif.
  render(visible());

  // Scroll kembali ke bagian recipe.
  $('recipes').scrollIntoView({
    behavior: 'smooth'
  });
}

// Tombol favorite di navbar akan membuka halaman favorite.
$('favoriteNav').addEventListener(
  'click',
  showFavorites
);

// Tombol favorite di footer juga membuka halaman favorite.
$('footerFav').addEventListener(
  'click',
  showFavorites
);

// Tombol back digunakan untuk kembali ke semua recipe.
$('back').addEventListener(
  'click',
  showAll
);

// Kalau API mengalami error, tombol retry akan menjalankan loadRecipes()
// lagi tanpa refresh halaman.
$('retry').addEventListener(
  'click',
  loadRecipes
);

// Function untuk mengatur tampilan saat data sedang diambil dari API.
function showLoading() {

  // Tampilkan loading.
  $('loading').hidden = false;

  // Sembunyikan error.
  $('error').hidden = true;

  // Sembunyikan pesan kosong.
  $('empty').hidden = true;

  // Sembunyikan recipe grid.
  $('grid').hidden = true;
}

// Function untuk menampilkan pesan error.
function showError(msg) {

  // Loading disembunyikan.
  $('loading').hidden = true;

  // Recipe grid disembunyikan.
  $('grid').hidden = true;

  // Pesan kosong disembunyikan.
  $('empty').hidden = true;

  // Bagian error ditampilkan.
  $('error').hidden = false;

  // Pesan error dimasukkan ke HTML.
  $('errorText').textContent = msg;
}

// Saat JavaScript selesai dibaca, function loadRecipes() langsung dijalankan.
// Ini yang membuat aplikasi mulai mengambil data recipe dari API ketika halaman dibuka.
loadRecipes();