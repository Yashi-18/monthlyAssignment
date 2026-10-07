const candidates = [
    {
        name: "Action",
        image: "images/action.jpg",
        votes: 0
    },

    {
        name: "Fantasy",
        image: "images/fantasy.jpg",
        votes: 0
    },

    {
        name: "Mystery",
        image: "images/mystery.jpg",
        votes: 0
    },

    {
        name: "Romance",
        image: "images/romance.jpg",
        votes: 0
    }
];

// Candidate yang sedang dipilih Awalnya Candidate One.
    

let selectedCandidate = candidates[0];


// Menyimpan jumlah seluruh vote.

let totalVotes = 0;


// ngambil elemnt d html

const candidateButtons =
    document.querySelectorAll(".candidate");

const heroImage =
    document.querySelector("#hero-image");

const heroName =
    document.querySelector("#hero-name");

const heroNumber =
    document.querySelector("#hero-number");

const heroVotes =
    document.querySelector("#hero-votes");

const heroPercentage =
    document.querySelector("#hero-percentage");

const heroRank =
    document.querySelector("#hero-rank");

const heroProgress =
    document.querySelector("#hero-progress");

const heroVote =
    document.querySelector("#hero-vote");

const totalVotesText =
    document.querySelector("#total-votes");

const currentWinner =
    document.querySelector("#current-winner");

const feedback =
    document.querySelector("#feedback");

const resetButton =
    document.querySelector("#reset-btn");


function updateHero() {

    //  Mengubah gambar candidate.

    heroImage.src =
        selectedCandidate.image;


    //  Mengubah nama candidate.

    heroName.textContent =
        selectedCandidate.name;


    //  Mencari nomor candidate.

    const candidateIndex =
        candidates.indexOf(selectedCandidate);


    const number =
        String(candidateIndex + 1).padStart(2, "0");


    heroNumber.textContent =
        number;


    // Mengubah rank.

    heroRank.textContent =
        "#" + number;


    // nampilin jumlah vote candidate nya

    heroVotes.textContent =
        selectedCandidate.votes;


    
      //  Menghitung percentage.
    

    let percentage = 0;


    if (totalVotes > 0) {

        percentage =
            (selectedCandidate.votes / totalVotes) * 100;

    }


    
       // Menampilkan percentage.
    

    heroPercentage.textContent =
        Math.round(percentage) + "%";


    
       // Mengubah progress bar.
    

    heroProgress.style.width =
        percentage + "%";

}


// card bisa d klik

candidateButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        // Mengambil data-id dari HTML.

        const id =
            button.dataset.id;


        
           // Mengambil candidate berdasarkan id.
        

        selectedCandidate =
            candidates[id];


        
           // Menghapus active dari semua card.
        

        candidateButtons.forEach(function (item) {

            item.classList.remove("active");

        });


        /*
            Memberikan active kepada card yang diklik.
        */

        button.classList.add("active");


        /*
            Mengubah isi hero.
        */

        updateHero();


        /*
            Feedback kepada user.
        */

        feedback.textContent =
            selectedCandidate.name +
            " is now selected.";

    });

});


/* =====================================================
   6. BUTTON VOTE
===================================================== */

heroVote.addEventListener("click", function () {

    /*
        Menambahkan 1 vote
        kepada candidate yang sedang dipilih.

        Contoh:

        0 → 1
        1 → 2
        2 → 3
    */

    selectedCandidate.votes++;


    /*
        Menambahkan total vote.
    */

    totalVotes++;


    /*
        Update tampilan hero.
    */

    updateHero();


    /*
        Update total votes di footer.
    */

    totalVotesText.textContent =
        totalVotes;


    /*
        Feedback setelah voting.
    */

    feedback.textContent =
        "Vote berhasil! Kamu memilih " +
        selectedCandidate.name;


    /*
        Update current winner.
    */

    updateWinner();

});


/* =====================================================
   7. FUNCTION CURRENT WINNER
===================================================== */

function updateWinner() {

    /*
        Untuk sementara,
        candidate pertama dianggap winner.
    */

    let winner =
        candidates[0];


    /*
        Mengecek semua candidate.
    */

    candidates.forEach(function (candidate) {

        /*
            Jika vote candidate sekarang
            lebih besar daripada winner,
            candidate tersebut menjadi winner.
        */

        if (candidate.votes > winner.votes) {

            winner = candidate;

        }

    });


    /*
        Jika belum ada vote,
        tampilkan tanda "-".
    */

    if (totalVotes === 0) {

        currentWinner.textContent = "—";

    } else {

        currentWinner.textContent =
            winner.name;

    }

}


/* =====================================================
   8. RESET VOTING
===================================================== */

resetButton.addEventListener("click", function () {

    /*
        Mengembalikan semua vote
        setiap candidate menjadi 0.
    */

    candidates.forEach(function (candidate) {

        candidate.votes = 0;

    });


    /*
        Mengembalikan total vote menjadi 0.
    */

    totalVotes = 0;


    /*
        Kembali memilih candidate pertama.
    */

    selectedCandidate =
        candidates[0];


    /*
        Menghapus active dari semua card.
    */

    candidateButtons.forEach(function (button) {

        button.classList.remove("active");

    });


    /*
        Candidate pertama kembali aktif.
    */

    candidateButtons[0].classList.add("active");


    /*
        Update hero.
    */

    updateHero();


    /*
        Update total vote.
    */

    totalVotesText.textContent =
        totalVotes;


    /*
        Update winner.
    */

    updateWinner();


    /*
        Feedback.
    */

    feedback.textContent =
        "Voting has been reset.";

});


/* =====================================================
   9. INITIAL DISPLAY
===================================================== */

/*
    Menampilkan data awal
    ketika website pertama kali dibuka.
*/

updateHero();

updateWinner();