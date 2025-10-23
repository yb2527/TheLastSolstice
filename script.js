// Firebase 설정 값
const firebaseConfig = {
    apiKey: "AIzaSyDGKJoQm3avLc6neDFz7WGvX56pU4XYT8Q",
    authDomain: "thelastsolstice-d1a1b.firebaseapp.com",
    projectId: "thelastsolstice-d1a1b",
    storageBucket: "thelastsolstice-d1a1b.appspot.com",
    messagingSenderId: "698221744631",
    appId: "1:698221744631:web:33323ed7e8e515f8de1ef2"
};

// Firebase 앱 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


window.onload = function() {
    
    // --- 1. 캐러셀 상태와 HTML 요소를 먼저 정의합니다. ---
    let currentPage = 1;
    let totalPages = 0;
    let isTransitioning = false;

    const slider = document.querySelector('.carousel-slider');
    const dotsContainer = document.querySelector('.pagination-dots');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const sendBtn = document.getElementById('sendBtn');
    const nicknameInput = document.getElementById('nickname');
    const messageInput = document.getElementById('message');

    // --- 2. 핵심 기능 함수들을 정의합니다. ---

    // 페이지 이동 함수
    function goToPage(pageNumber, withAnimation = true) {
        isTransitioning = true;
        
        currentPage = pageNumber;
        
        slider.style.transition = withAnimation ? 'transform 0.5s ease-in-out' : 'none';
        slider.style.transform = `translateX(-${currentPage * 100}%)`;
        
        updateDots();
    }

    // 페이지네이션 점 업데이트 함수
    function updateDots() {
        const dots = document.querySelectorAll('.dot');
        if (dots.length === 0) return;
        dots.forEach(dot => dot.classList.remove('active'));
        // 실제 페이지 번호를 계산 (0-based index)
        const actualPage = (currentPage - 1 + totalPages) % totalPages;
        if(dots[actualPage]) {
            dots[actualPage].classList.add('active');
        }
    }

    // DB에서 데이터를 가져와 캐러셀을 그리는 함수
    function fetchMessagesAndBuildCarousel(pageToShow = 'first') {
        db.collection("messages").orderBy("timestamp", "asc").get()
            .then((snapshot) => {
                const messages = snapshot.docs.map(doc => doc.data());
                totalPages = Math.ceil(messages.length / 10);
                
                buildCarouselDOM(messages);
                
                let targetPage;
                if (pageToShow === 'last') {
                    // 'last'가 들어오면 마지막 페이지로 설정
                    targetPage = totalPages > 1 ? totalPages : 0;
                } else {
                    // 그 외에는 첫 페이지로 설정
                    targetPage = totalPages > 1 ? 1 : 0;
                }
                
                // 애니메이션 없이 해당 페이지로 바로 이동
                goToPage(targetPage, false);
            })
            .catch((error) => console.error("메시지 불러오기 실패: ", error));
    }

    // 실제 HTML 요소를 만드는 역할만 하는 함수
    function buildCarouselDOM(messages) {
        slider.innerHTML = '';
        dotsContainer.innerHTML = '';

        if (totalPages > 0) {
            // 페이지와 메시지 버튼 생성
            for (let i = 0; i < totalPages; i++) {
                const page = document.createElement('div');
                page.className = 'carousel-page';
                const start = i * 10;
                const end = start + 10;
                const pageMessages = messages.slice(start, end);
                
                pageMessages.forEach(msg => {
                    const messageDot = document.createElement('div');
                    messageDot.className = 'message-dot';
                    messageDot.textContent = msg.nickname;
                    page.appendChild(messageDot);
                });
                slider.appendChild(page);
            }

            // 무한 슬라이드를 위한 클론 생성
            if (totalPages > 1) {
                const firstPageClone = slider.firstElementChild.cloneNode(true);
                const lastPageClone = slider.lastElementChild.cloneNode(true);
                slider.appendChild(firstPageClone);
                slider.insertBefore(lastPageClone, slider.firstElementChild);
            }
        }

        // 페이지네이션 점 생성
        if (totalPages > 1) {
            for (let i = 0; i < totalPages; i++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                dotsContainer.appendChild(dot);
            }
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }

    // --- 3. 이벤트 리스너를 딱 한 번만 등록합니다. ---

    // 입력창 활성화 로직
    function checkInputs() {
        sendBtn.disabled = !(nicknameInput.value.trim() && messageInput.value.trim());
    }
    nicknameInput.addEventListener('input', checkInputs);
    messageInput.addEventListener('input', checkInputs);

    // 메시지 전송 버튼
    sendBtn.onclick = function() {
        db.collection("messages").add({
            nickname: nicknameInput.value,
            message: messageInput.value,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            nicknameInput.value = '';
            messageInput.value = '';
            checkInputs();
            fetchMessagesAndBuildCarousel(); // 데이터 새로고침
            fetchMessagesAndBuildCarousel('last');
        }).catch((error) => console.error("메시지 저장 실패: ", error));
    };

    // 이전/다음 버튼
    prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

    // 슬라이드 애니메이션이 끝난 후 처리 (무한루프 핵심)
    slider.addEventListener('transitionend', () => {
        isTransitioning = false;
        if (currentPage === 0) {
            goToPage(totalPages, false); // 애니메이션 없이 마지막 페이지로
        }
        if (currentPage === totalPages + 1) {
            goToPage(1, false); // 애니메이션 없이 첫 페이지로
        }
    });

    // --- 4. 최초 실행 ---
    fetchMessagesAndBuildCarousel();
};