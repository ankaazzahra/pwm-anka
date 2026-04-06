$(document).ready(function () {
  const $content = $("#content");
  const githubUsername = 'ankaazzahra'; // Ganti dengan username GitHub Anda

  // ==========================================
  // --- 1. CORE SPA NAVIGATION ENGINE ---
  // ==========================================
  
  function loadPage(pageUrl) {
      // A. Mulai Animasi Fade Out (Hapus kelas fade-in)
      $content.removeClass("fade-in");
      
      // B. Beri sedikit jeda waktu agar animasi fade-out selesai (400ms sesuai CSS transition)
      setTimeout(function() {
          // C. Muat konten baru menggunakan .load()
          $content.load(pageUrl, function (response, status, xhr) {
              if (status == "error") {
                  $content.html("<div class='text-center py-20 italic text-stone-400'>Halaman tidak ditemukan...</div>");
              }
              
              // D. Seteleah konten dimuat, jalankan animasi Fade In
              $content.addClass("fade-in");
              
              // E. Scroll ke atas secara halus
              window.scrollTo({ top: 0, behavior: 'smooth' });

              // F. LOGIKA KHUSUS SETELAH HALAMAN DIMUAT
              // Jika halaman yang dimuat adalah github.html, panggil fungsi API
              if (pageUrl.includes("github.html")) {
                  window.fetchGithub(githubUsername);
              }
              
              // Jika halaman contact.html dimuat, cek local storage untuk autofill
              if (pageUrl.includes("contact.html")) {
                  checkContactLocalStorage();
              }
          });
      }, 400); // Harus sama atau sedikit lebih lama dari durasi transisi CSS
  }

  // --- Inisialisasi: Muat Halaman Home saat pertama dibuka ---
  // Update aktifkan menu home di navigasi
  $(`.nav-item[data-page="home.html"]`).addClass("nav-active mobile-nav-active");
  loadPage("home.html");


  // --- Event Listener untuk Klik Navigasi ---
  $(".nav-item").click(function () {
      const $this = $(this);
      const pageToLoad = $this.data("page");

      // Jangan muat ulang jika klik halaman yang sama
      if ($this.hasClass("nav-active")) return;

      // Reset semua status aktif
      $(".nav-item").removeClass("nav-active mobile-nav-active");
      
      // Aktifkan item yang diklik (baik di desktop maupun mobile)
      $(`.nav-item[data-page="${pageToLoad}"]`).addClass("nav-active mobile-nav-active");
      
      // Muat halaman
      loadPage(pageToLoad);
  });


  // ==========================================
  // --- 2. GITHUB API FUNCTION (GLOBAL) ---
  // ==========================================
  
  // Dibuat global (window.) agar bisa diakses oleh logika navigasi di atas
  window.fetchGithub = (username) => {
      const $projectContainer = $('#github-projects');
      
      // Keamanan: Jika elemen container tidak ditemukan di DOM, hentikan fungsi
      if ($projectContainer.length === 0) return;

      $.ajax({
          url: `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`,
          method: "GET",
          success: function (repos) {
              let cardsHtml = "";
              $projectContainer.empty(); // Hapus spinner loading

              if (repos.length === 0) {
                  $projectContainer.html('<p class="col-span-full text-center text-stone-400 italic py-10">Tidak ada project publik yang ditemukan.</p>');
                  return;
              }

              repos.forEach(repo => {
                  const desc = repo.description || "Project kreatif yang dikembangkan dengan dedikasi.";
                  const lang = repo.language || "Web Project";
                  
                  // Template Card Estetik
                  cardsHtml += `
                      <a href="${repo.html_url}" target="_blank" class="group bg-white border border-stone-50 p-7 rounded-[2.5rem] hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
                          <div>
                              <div class="flex justify-between items-center mb-6">
                                  <div class="w-10 h-10 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 group-hover:text-orange-500 transition-colors">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>
                                  </div>
                                  <span class="text-[9px] font-black text-orange-400 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">${lang}</span>
                              </div>
                              <h3 class="text-lg font-bold text-stone-800 mb-3 lowercase tracking-tight group-hover:text-orange-600 transition-colors">/${repo.name}</h3>
                              <p class="text-stone-400 text-xs leading-relaxed line-clamp-3 mb-8 italic">${desc}</p>
                          </div>
                          <div class="flex items-center gap-4 text-[10px] font-bold text-stone-300 uppercase tracking-widest border-t border-stone-50 pt-4">
                              <span>⭐ ${repo.stargazers_count}</span>
                              <span>🍴 ${repo.forks_count}</span>
                          </div>
                      </a>`;
              });
              $projectContainer.html(cardsHtml);
          },
          error: function () {
              $projectContainer.html('<div class="col-span-full text-center py-10"><p class="text-rose-400 font-bold uppercase text-[10px] tracking-widest">Gagal mengambil data dari GitHub.</p><p class="text-stone-400 text-xs mt-2">Cek koneksi internet atau limit API.</p></div>');
          }
      });
  };


  // ==========================================
  // --- 3. CONTACT FORM LOGIC ---
  // ==========================================

  // A. Fungsi Autofill LocalStorage (Dipanggil saat contact.html dimuat)
  function checkContactLocalStorage() {
      if (localStorage.getItem("anka_cv_name")) $("#name").val(localStorage.getItem("anka_cv_name"));
      if (localStorage.getItem("anka_cv_email")) $("#email").val(localStorage.getItem("anka_cv_email"));
  }

  // B. Event Delegation untuk Submit Form
  // PENTING: Kita bind event ke $(document) karena #contactForm dimuat secara dinamis.
  $(document).on("submit", "#contactForm", function (e) {
      e.preventDefault(); // Mencegah reload halaman
      
      const $form = $(this);
      const name = $("#name").val().trim();
      const email = $("#email").val().trim();
      const message = $("#message").val().trim();
      let isValid = true;

      // Reset Status Error
      $form.find(".error-msg").addClass("hidden").text("");
      $form.find("input, textarea").removeClass("border-rose-300 focus:ring-rose-200");

      // --- Validasi Sederhana ---
      if (name === "") {
          $("#name").addClass("border-rose-300 focus:ring-rose-200").next(".error-msg").removeClass("hidden").text("Nama jangan kosong ya! ✨");
          isValid = false;
      }
      
      // Regex validasi email dasar
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          $("#email").addClass("border-rose-300 focus:ring-rose-200").next(".error-msg").removeClass("hidden").text("Format email sepertinya salah..");
          isValid = false;
      }

      if (message.length < 10) {
          $("#message").addClass("border-rose-300 focus:ring-rose-200").next(".error-msg").removeClass("hidden").text("Tulis pesan minimal 10 karakter ya.");
          isValid = false;
      }

      // --- Jika Valid, Lakukan Simulasi Pengiriman ---
      if (isValid) {
          // Simpan nama & email ke LocalStorage agar tidak perlu ngetik lagi nanti
          localStorage.setItem("anka_cv_name", name);
          localStorage.setItem("anka_cv_email", email);

          // Efek Loading Tombol
          const $btn = $("#btnKirim");
          const originalText = $btn.text();
          $btn.text("Mengirim... ⏳").prop("disabled", true).addClass("opacity-60 scale-95");

          // Simulasi AJAX delay (1.5 detik)
          setTimeout(function () {
              // Tampilkan Pesan Sukses
              $("#successMsg").fadeIn().removeClass("hidden");
              
              // Reset Form
              $form[0].reset();
              
              // Kembalikan tombol
              $btn.text(originalText).prop("disabled", false).removeClass("opacity-60 scale-95");
              
              // Autofill kembali dari storage setelah reset
              checkContactLocalStorage();
          }, 1500);
      }
  });

  // C. Event Delegation untuk tombol "Kirim Lagi"
  $(document).on("click", "#btnKirimLagi", function() {
      $("#successMsg").fadeOut().addClass("hidden");
  });

});