// 의류 등록 위한 팝업
function show () {
    document.querySelector(".background").className = "background show";
}

function close () { 
document.querySelector(".background").className = "background";
}

document.querySelector("#show").addEventListener('click', show);
document.querySelector("#close").addEventListener('click', close);

// 선택한 이미지 보여주기
const fileInput = document.getElementById("fileUpload");

const handleFiles = (e) => {
    const selectedFile = [...fileInput.files];
    const fileReader = new FileReader();

    fileReader.readAsDataURL(selectedFile[0]);

    fileReader.onload = function () {
        document.getElementById("previewImg").src = fileReader.result;
    };
};

fileInput.addEventListener("change", handleFiles);

// 사진 추가하기
function add () {
    // 등록할 사진 DB에 전달 후 웹페이지에 보여줘야할 부분 

    document.querySelector(".background").className = "background";
}

document.querySelector("#add").addEventListener('click', add);
