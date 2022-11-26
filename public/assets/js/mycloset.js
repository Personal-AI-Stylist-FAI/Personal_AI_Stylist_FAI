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

let fileReader;
const handleFiles = (e) => {
    const selectedFile = [...fileInput.files];
    //const fileReader = new FileReader();
    fileReader = new FileReader();

    fileReader.readAsDataURL(selectedFile[0]);

    fileReader.onload = function () {
        document.getElementById("previewImg").src = fileReader.result;
    };
};

fileInput.addEventListener("change", handleFiles);

// 사진 추가하기
function add () {
    // 등록할 사진 DB에 전달 후 웹페이지에 보여줘야할 부분
    // 상의로 분류되게 함
    // const src = fileReader.result;
    
    // const cloth =
    //     `<div class="port_item xs-m-top-30">
    //         <div class="port_img">
    //             <img src="${src}" alt="" />
    //             <div class="port_overlay text-center">
    //                 <a href="${src}" class="popup-img">+</a>
    //             </div>
    //         </div>
    //     </div>`;

    // // 이미지 클로젯에 나타나게 하기
    // document.querySelector("#new-add-cloth").innerHTML = cloth;



    // 팝업에서 선택한 것들 초기화
   // document.getElementById('fileUpload').value = "";
   // document.getElementById("previewImg").src = "";

    document.querySelector(".background").className = "background";
}

document.querySelector("#add").addEventListener('click', add);




// 등록한 사진 DB에 전달 후 화면에 출력
// 절대 경로 붙이기
const ABSOLUTE_PATH = 'C:/node_workspace/express-mysql-example/public/images/';
const RELATIVE_PATH = '../public/images/';

// 옷 추가 눌렀을 때
$(document).ready(function() {
    $("#add").click(getCloset);
    
    getCloset();
    // getClosetClass();
});

function getCloset() { // 사용자 의류 이미지 화면에 출력
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/mycloset/myclosetclothes",
        data: {},
        success: function (response) {
            let top_address_array = [];
            let bottom_address_array = [];
            let onepiece_address_array = [];
            let outer_address_array = [];

            var image_address = "";
/* 
            for(var i=0; i<response['top'].length; i++) {
                image_address = RELATIVE_PATH + response['top'][i];
                top_address_array.push(image_address);
            }

            for(var i=0; i<response['bottom'].length; i++) {
                image_address = RELATIVE_PATH + response['bottom'][i];
                bottom_address_array.push(image_address);
            }

            for(var i=0; i<response['onepiece'].length; i++) {
                image_address = RELATIVE_PATH + response['onepiece'][i];
                onepiece_address_array.push(image_address);
            }

            for(var i=0; i<response['outer'].length; i++) {
                image_address = RELATIVE_PATH + response['outer'][i];
                outer_address_array.push(image_address);
            } 
*/

            for(var i=0; i<response['top'].length; i++) {
                image_address = RELATIVE_PATH + response['top'][i]['url'];
                top_address_array.push(image_address);
            }

            for(var i=0; i<response['bottom'].length; i++) {
                image_address = RELATIVE_PATH + response['bottom'][i]['url'];
                bottom_address_array.push(image_address);
            }

            for(var i=0; i<response['onepiece'].length; i++) {
                image_address = RELATIVE_PATH + response['onepiece'][i]['url'];
                onepiece_address_array.push(image_address);
            }

            for(var i=0; i<response['outer'].length; i++) {
                image_address = RELATIVE_PATH + response['outer'][i]['url'];
                outer_address_array.push(image_address);
            } 


            for(var i=0; i<top_address_array.length; i++) {
                document.getElementById("mycloset_top"+String(i+1)).src = top_address_array[i];
                document.getElementById("index_clothes_type_top"+String(i+1)).textContent = response['top'][i]['classname'];
                document.getElementById("index_clothes_color_top"+String(i+1)).textContent = response['top'][i]['color'];
            }

            for(var i=0; i<bottom_address_array.length; i++) {
                document.getElementById("mycloset_bottom"+String(i+1)).src = bottom_address_array[i];
                document.getElementById("index_clothes_type_bottom"+String(i+1)).textContent = response['bottom'][i]['classname'];
                document.getElementById("index_clothes_color_bottom"+String(i+1)).textContent = response['bottom'][i]['color'];
            }

            for(var i=0; i<onepiece_address_array.length; i++) {
                document.getElementById("mycloset_onepiece"+String(i+1)).src = onepiece_address_array[i];
                document.getElementById("index_clothes_type_onepiece"+String(i+1)).textContent = response['onepiece'][i]['classname'];
                document.getElementById("index_clothes_color_onepiece"+String(i+1)).textContent = response['onepiece'][i]['color'];
            }

            for(var i=0; i<outer_address_array.length; i++) {
                document.getElementById("mycloset_outer"+String(i+1)).src = outer_address_array[i];
                document.getElementById("index_clothes_type_outer"+String(i+1)).textContent = response['outer'][i]['classname'];
                document.getElementById("index_clothes_color_outer"+String(i+1)).textContent = response['outer'][i]['color'];
            }
            
            document.getElementById("closet_ment_username").textContent = response['user_name'] + " 님의 CLOSET";
        }
    })
}

/*
function getClosetClass() { // 사용자 의류 클래스 화면에 출력
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/getClosetClass",
        data: {},
        success: function (response) {
            const res = response[0];
            for(var i=0; i<res.length; i++) {
                // 종류
                document.getElementById("index_clothes_type" + String(i+1)).textContent = response[i]['type'];

                // 색상
                if(response[i]['class'].slice(0, 1) == 'W') {
                    document.getElementById("index_clothes_color" + String(i+1)).textContent = response[i]['class'].slice(2);    
                }
                else {
                    document.getElementById("index_clothes_color" + String(i+1)).textContent = response[i]['class'].slice(1);
                }
            }
        }
    })
}
*/