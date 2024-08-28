const container = document.querySelector('.image-container');
const startButton = document.querySelector('.start-button');
const gameText = document.querySelector('.game-text');
const playTime = document.querySelector('.play-time');
const imageUpload = document.querySelector('#image-upload');

const tileCount = 16;

let tiles = [];

const dragged = {
    el: null,
    class: null,
    index: null,
};

let isPlaying = false;
let timeInterval = null;
let time = 0;

// functions
function checkStatus() {
    const currentList = [...container.children];
    const unMatchedList = currentList.filter((child, index) => {
        return Number(child.getAttribute('data-index')) !== index;
    });
    if (unMatchedList.length === 0) {
        gameText.style.display = 'block';
        isPlaying = false;
        clearInterval(timeInterval);
    }
}

function setGame(imageSrc) {
    isPlaying = true;
    time = 0;
    container.innerHTML = '';
    gameText.style.display = 'none';
    clearInterval(timeInterval);
    timeInterval = setInterval(() => {
        playTime.innerText = time;
        time++;
    }, 1000);

    tiles = createImageTiles(imageSrc);

    setTimeout(() => {
        shuffle(tiles).forEach((tile) => container.appendChild(tile));
    }, 2000);
}

function createImageTiles(imageSrc) {
    const tempArray = [];
    const img = new Image();
    img.src = imageSrc;

    img.onload = function () {
        const width = img.width;
        const height = img.height;
        const pieceWidth = width / 4;
        const pieceHeight = height / 4;

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const li = document.createElement('li');
                li.setAttribute('data-index', y * 4 + x);
                li.setAttribute('draggable', 'true');
                li.style.position = 'relative';
                li.style.width = `${pieceWidth}px`;
                li.style.height = `${pieceHeight}px`;
                li.style.overflow = 'hidden';
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.justifyContent = 'center';
                li.style.fontSize = '20px'; // 인덱스 번호 크기
                li.style.color = 'red'; // 인덱스 번호 색상
                li.style.fontWeight = 'bold'; // 인덱스 번호 굵기

                const piece = new Image();
                piece.src = imageSrc;
                piece.style.position = 'absolute';
                piece.style.width = `${width}px`;
                piece.style.height = `${height}px`;
                piece.style.left = `-${x * pieceWidth}px`;
                piece.style.top = `-${y * pieceHeight}px`;

                // 인덱스 번호 텍스트 추가
                li.textContent = y * 4 + x;

                li.appendChild(piece);
                li.classList.add(`list${y * 4 + x}`);
                tempArray.push(li);
            }
        }

        // 이미지 타일이 생성된 후에야 컨테이너에 추가
        tempArray.forEach((tile) => {
            container.appendChild(tile);
        });

        // 생성된 타일들에 드래그 이벤트 핸들러 추가
        tempArray.forEach((tile) => {
            tile.addEventListener('dragstart', dragStartHandler);
            tile.addEventListener('dragover', dragOverHandler);
            tile.addEventListener('drop', dropHandler);
        });
    };

    return tempArray;
}

function shuffle(array) {
    let index = array.length - 1;
    while (index > 0) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
        index--;
    }
    return array;
}

// Drag and Drop Event Handlers
function dragStartHandler(e) {
    if (!isPlaying) return;
    const obj = e.target.closest('li'); // li 요소를 타겟으로 설정
    dragged.el = obj;
    dragged.class = obj.className;
    dragged.index = [...obj.parentNode.children].indexOf(obj);

    // 드래그 중 잔상을 없애기 위해 투명한 이미지 사용
    const emptyImage = new Image();
    emptyImage.src = '';
    e.dataTransfer.setDragImage(emptyImage, 0, 0);
}

function dragOverHandler(e) {
    e.preventDefault(); // drop 이벤트를 허용하려면 이 이벤트가 필요함
}

function dropHandler(e) {
    if (!isPlaying) return;
    const obj = e.target.closest('li');

    if (obj && obj !== dragged.el && obj.className !== dragged.class) {
        let originPlace;
        let isLast = false;

        if (dragged.el.nextSibling) {
            originPlace = dragged.el.nextSibling;
        } else {
            originPlace = dragged.el.previousSibling;
            isLast = true;
        }
        const droppedIndex = [...obj.parentNode.children].indexOf(obj);
        dragged.index > droppedIndex ? obj.before(dragged.el) : obj.after(dragged.el);
        isLast ? originPlace.after(obj) : originPlace.before(obj);
    }
    checkStatus();
}

// Start button event
startButton.addEventListener('click', () => {
    if (imageUpload.files.length > 0) {
        const file = imageUpload.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            setGame(e.target.result);
        };

        reader.readAsDataURL(file);
    } else {
        alert('Please upload an image before starting the game!');
    }
});

imageUpload.addEventListener('change', (e) => {
    if (isPlaying) {
        alert('Please wait for the current game to finish before uploading a new image.');
    }
});
