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
    let messages = [];
    let currentMessageIndex = 0;

    const slider = document.querySelector('.carousel-slider');
    const dotsContainer = document.querySelector('.pagination-dots');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const sendBtn = document.getElementById('sendBtn');
    const nicknameInput = document.getElementById('nickname');
    const messageInput = document.getElementById('message');

    const modalContainer = document.getElementById('messageModal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const closeModalBtn = document.querySelector('.close-btn');
    const modalPagination = document.querySelector('.modal-pagination');
    const modalNickname = document.querySelector('.modal-nickname');
    const modalMessage = document.querySelector('.modal-message');
    const modalPrevBtn = document.querySelector('.modal-nav.prev');
    const modalNextBtn = document.querySelector('.modal-nav.next');
    const modalContent = document.querySelector('.modal-content');
    const contentWrapper = document.querySelector('.content-wrapper');

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
        db.collection("messages").get() 
            .then((snapshot) => {
                // 데이터를 가져와서 messages 변수에 저장 (timestamp가 있으면 그걸로 정렬)
                messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // 자바스크립트에서 직접 정렬
                messages.sort((a, b) => {
                    const timeA = a.timestamp ? a.timestamp.seconds : 0;
                    const timeB = b.timestamp ? b.timestamp.seconds : 0;
                    return timeA - timeB; // 오름차순 (옛날 -> 최신)
                });

                totalPages = Math.ceil(messages.length / 10);
                
                // 화면 그리기
                buildCarouselDOM(messages);
                
                // 페이지 이동
                let targetPage;
                if (pageToShow === 'last') {
                    targetPage = totalPages > 1 ? totalPages : 0;
                } else {
                    targetPage = totalPages > 1 ? 1 : 0;
                }
                goToPage(targetPage, false);
            })
            .catch((error) => {
                console.error("메시지 불러오기 실패: ", error);
                // 에러가 나더라도 배경 화면은 뜨게 함
                buildCarouselDOM([]); 
            });
    }

    // 메시지 위치 좌표
    const messageDotPositions = [
        { top: '35%', left: '40.1%' }, // 0번 메시지
        { top: '38%', left: '23%', labelPosition: 'top'  }, // 1번 메시지
        { top: '48.5%', left: '13%', labelPosition: 'top' }, // 2번 메시지
        { top: '54%', left: '23%' }, // 3번 메시지
        { top: '54%', left: '40.1%' }, // 4번 메시지
        { top: '53.5%', left: '55%' }, // 5번 메시지
        { top: '53.5%', left: '73%' }, // 6번 메시지
        { top: '48%', left: '79.5%', labelPosition: 'top' }, // 7번 메시지
        { top: '54%', left: '89.6%' }, // 8번 메시지
        { top: '70.5%', left: '40.1%' }, // 9번 메시지
    ];

    // 실제 HTML 요소를 만드는 역할만 하는 함수
    function buildCarouselDOM(messages) {
        slider.style.transition = 'none';
        slider.style.transform = 'translateX(0px)';

        // 기존 내용 삭제
        slider.innerHTML = '';
        dotsContainer.innerHTML = '';

        const pagesToCreate = (totalPages > 0) ? totalPages : 1;

        if (pagesToCreate > 0) {
            // 페이지와 메시지 버튼 생성
            for (let i = 0; i < pagesToCreate; i++) {
                const page = document.createElement('div');
                page.className = 'carousel-page';

                const backgroundImageWrapper = document.createElement('div');
                backgroundImageWrapper.className = 'background-image-wrapper';
                
                const backgroundImage = document.createElement('img');
                backgroundImage.src = 'images/bg.png';
                backgroundImage.alt = '배경 이미지';
                backgroundImage.className = 'carousel-background-image';
                backgroundImageWrapper.appendChild(backgroundImage);
                
                if (messages.length === 0) {
                    const emptyMessage = document.createElement('div');
                    emptyMessage.textContent = "아직 작성된 메시지가 없어요.\n첫 번째 주인공이 되어보세요! 🥳";
                    emptyMessage.style.position = 'absolute';
                    emptyMessage.style.top = '50%';
                    emptyMessage.style.left = '50%';
                    emptyMessage.style.transform = 'translate(-50%, -50%)';
                    emptyMessage.style.textAlign = 'center';
                    emptyMessage.style.color = '#000000ff';
                    emptyMessage.style.fontSize = '0.8rem';
                    emptyMessage.style.zIndex = '5';
    
                    backgroundImageWrapper.appendChild(emptyMessage);
                }
            
                page.appendChild(backgroundImageWrapper);

                const start = i * 10;
                const end = start + 10;
                const pageMessages = messages.slice(start, end);
                
                pageMessages.forEach((msg, idx) => {
                    const messageWrapper = document.createElement('div');
                    messageWrapper.className = 'message-icon-wrapper';

                    const absoluteIndex = start + idx;
                    messageWrapper.dataset.index = absoluteIndex;

                    const positionIndex = absoluteIndex % messageDotPositions.length; 
                    const positionInfo = messageDotPositions[positionIndex] || { top: '50%', left: '50%', labelPosition: 'bottom' };

                    if (positionInfo.labelPosition === 'top') {
                        messageWrapper.classList.add('label-above');
                    }

                    // 아이콘 이미지 생성
                    const messageIcon = document.createElement('img');
                    messageIcon.src = 'images/Vector (1).svg';
                    messageIcon.dataset.hoverSrc = 'images/Vector (2).svg';
                    messageIcon.alt = msg.nickname;
                    messageIcon.className = 'message-icon';

                    // 마우스 오버 이벤트 추가
                    messageWrapper.addEventListener('mouseenter', () => {
                        messageIcon.src = messageIcon.dataset.hoverSrc;
                    });
                    messageWrapper.addEventListener('mouseleave', () => {
                        messageIcon.src = 'images/Vector (1).svg'; // 기본 이미지로 되돌리기
                    });

                    // 닉네임 라벨 생성
                    const nicknameLabel = document.createElement('span');
                    nicknameLabel.className = 'nickname-label';
                    nicknameLabel.textContent = msg.nickname;

                    messageWrapper.appendChild(messageIcon);
                    messageWrapper.appendChild(nicknameLabel);

                    messageWrapper.style.top = positionInfo.top;
                    messageWrapper.style.left = positionInfo.left;

                    backgroundImageWrapper.appendChild(messageWrapper);
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

    // 모달 너비를 동기화
    function syncModalWidth() {
        // content-wrapper의 실제 너비를 측정합니다.
        const wrapperWidth = contentWrapper.offsetWidth;
        // 모달의 너비를 wrapper의 내부 콘텐츠 너비와 맞춥니다 (좌우 패딩 20px씩 총 40px 제외).
        modalContent.style.width = `${wrapperWidth - 40}px`;
    }

    // 모달을 여는 함수
    function showMessage(index) {
        if (index < 0 || index >= messages.length) return;
        
        currentMessageIndex = index;
        const messageData = messages[currentMessageIndex];

        modalPagination.textContent = `${currentMessageIndex + 1} / ${messages.length}`;
        modalNickname.textContent = messageData.nickname;
        modalMessage.textContent = messageData.message;

        // 모달을 열기 전에 너비를 먼저 맞춥니다.
        syncModalWidth();
        modalContainer.classList.remove('hidden');

        // 창 크기가 변경될 때마다 너비를 다시 맞추도록 이벤트 리스너를 추가합니다.
        window.addEventListener('resize', syncModalWidth);
    }

    // 모달을 닫는 함수
    function closeModal() {
        modalContainer.classList.add('hidden');
        // 모달이 닫히면 더 이상 필요 없는 resize 이벤트 리스너를 제거합니다. (성능 최적화)
        window.removeEventListener('resize', syncModalWidth);
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
            fetchMessagesAndBuildCarousel('last');
        }).catch((error) => console.error("메시지 저장 실패: ", error));
    };

    // 이전/다음 버튼
    prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

    // 슬라이드 애니메이션이 끝난 후 처리 (무한루프 핵심)
    slider.addEventListener('transitionend', () => {
        isTransitioning = false;

        // 페이지가 1개 이하라면 무한 루프 로직을 실행하지 않고 종료
        if (totalPages <= 1) return;

        if (currentPage === 0) {
            goToPage(totalPages, false); // 애니메이션 없이 마지막 페이지로
        }
        if (currentPage === totalPages + 1) {
            goToPage(1, false); // 애니메이션 없이 첫 페이지로
        }
    });

    // 모달 열기 (이벤트 위임 사용)
    slider.addEventListener('click', function(event) {
        const wrapper = event.target.closest('.message-icon-wrapper');

        if (wrapper) {
            const index = parseInt(wrapper.dataset.index, 10);
            showMessage(index);
        }
    });

    // 모달 닫기
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // 모달 내비게이션
    modalPrevBtn.addEventListener('click', () => {
        const prevIndex = (currentMessageIndex - 1 + messages.length) % messages.length;
        showMessage(prevIndex);
    });
    modalNextBtn.addEventListener('click', () => {
        const nextIndex = (currentMessageIndex + 1) % messages.length;
        showMessage(nextIndex);
    });


    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50; // 최소 50px 이상 움직여야 슬라이드로 인정

    // 터치 시작 (손가락 닿음 / 마우스 누름)
    slider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    slider.addEventListener('mousedown', e => {
        touchStartX = e.screenX;
    });

    // 터치 끝 (손가락 뗌 / 마우스 뗌)
    slider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    slider.addEventListener('mouseup', e => {
        touchEndX = e.screenX;
        handleSwipe();
    });

    // 스와이프 방향 계산 및 페이지 이동 함수
    function handleSwipe() {
        // 페이지가 1개 이하라면 스와이프 동작 무시
        if (totalPages <= 1) return;

        const distance = touchStartX - touchEndX;

        // 이동 거리가 너무 짧으면 무시
        if (Math.abs(distance) < minSwipeDistance) return;

        if (distance > 0) {
            // 오른쪽에서 왼쪽으로 드래그 (다음 페이지)
            goToPage(currentPage + 1);
        } else {
            // 왼쪽에서 오른쪽으로 드래그 (이전 페이지)
            goToPage(currentPage - 1);
        }
    }

    // --- 4. 최초 실행 ---
    fetchMessagesAndBuildCarousel();
};
