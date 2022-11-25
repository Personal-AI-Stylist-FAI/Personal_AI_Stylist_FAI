// 캘린더 그리기
let date = new Date();

const renderCalendar = () => {
    const viewYear = date.getFullYear();
    const viewMonth = date.getMonth();

    // year-month 채우기
    document.querySelector('.year-month').textContent = `${viewYear}년 ${viewMonth + 1}월`;

    // 지난 달 마지막 Date, 이번 달 마지막 Date
    const prevLast = new Date(viewYear, viewMonth, 0);
    const thisLast = new Date(viewYear, viewMonth + 1, 0);

    const PLDate = prevLast.getDate();
    const PLDay = prevLast.getDay();

    const TLDate = thisLast.getDate();
    const TLDay = thisLast.getDay();

    // Dates 기본 배열들
    const prevDates = [];
    const thisDates = [...Array(TLDate + 1).keys()].slice(1);
    const nextDates = [];

    // prevDates 계산
    if (PLDay !== 6) {
        for (let i = 0; i < PLDay + 1; i++) {
        prevDates.unshift(PLDate - i);
        }
    }

    // nextDates 계산
    for (let i = 1; i < 7 - TLDay; i++) {
        nextDates.push(i)
    }

    // Dates 합치기
    const dates = prevDates.concat(thisDates, nextDates);

    // Dates 정리
    // 이전 달, 다음 달 날짜 투명도 조절
    const firstDateIndex = dates.indexOf(1);
    const lastDateIndex = dates.lastIndexOf(TLDate);
    dates.forEach((date, i) => {
        const condition = i >= firstDateIndex && i < lastDateIndex + 1
                        ? 'this'
                        : 'other';

        let dateId;
        if(date.toString().length == 1) {
            dateId = '0' + date;
        }
        else {
            dateId = date;
        }
        
        dates[i] = `<div class="date">
                        <span class="${condition}">${date}</span>
                        <div class="schedule-box">
                            <span class="schedule" id="${viewYear}-${viewMonth+1}-${dateId}schedule"></span>
                            <button class="schedule_remove_btn" id="${viewYear}-${viewMonth+1}-${dateId}" type="button" ></button>
                        </div>
                        <div class="cody-box">
                            <img class="cody-image" id="${viewYear}-${viewMonth+1}-${dateId}cody" />
                            <button class="cody_remove_btn" id="${viewYear}-${viewMonth+1}-${dateId}codyimg" type="button" ></button>
                        </div>
                    </div>`;
    })

    // Dates 그리기
    document.querySelector('.dates').innerHTML = dates.join('');    

    // 오늘 날짜 표시하기
    const today = new Date();
    if (viewMonth === today.getMonth() && viewYear === today.getFullYear()) {
        for (let date of document.querySelectorAll('.this')) {
            if (+date.innerText === today.getDate()) {
                date.classList.add('today');
                break;
            }
        }
    }
}
  
renderCalendar();

// 지난달, 다음달 오늘 날짜로 돌아가기
const prevMonth = () => {
    date.setDate(1);
    date.setMonth(date.getMonth() - 1);
    renderCalendar();
}

const nextMonth = () => {
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    renderCalendar();
}

const goToday = () => {
    date = new Date();
    renderCalendar();
}




// 일정 추가를 위한 팝업
function show () {
    document.querySelector(".background").className = "background show";
}
  
function close () { 
    document.querySelector(".background").className = "background";
}

// 선택한 일정 담을 변수
let schedule;

function add () { 
    // 선택한 날짜 가져오기
    const date = document.getElementById('date-input').value;
    let day = date.split("-");

    // if(day[1].slice(0, 1) === '0') {
    //     day[1] = day[1].slice(1);
    // }

    // if(day[2].slice(0, 1) === '0') {
    //     day[2] = day[2].slice(1);
    // }

    // document.getElementById(day[1]+'-'+day[2]+'schedule').textContent = schedule;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // document.getElementById(date + 'schedule').textContent = schedule;

    // 일정 등록 팝업에서 선택된 내용들 초기화
    document.getElementById('date-input').value = null;
    document.getElementById('selectSchedule').selectedIndex = 0;
    //document.getElementsByClassName('dropbtn_content').textContent = "";
    schedule = null;

    document.querySelector(".background").className = "background";
}
  
document.querySelector("#show").addEventListener('click', show);
document.querySelector("#close").addEventListener('click', close);
document.querySelector("#add").addEventListener('click', add);


// 현지언니가 수정한 select 드롭다운으로 했을 때
// 선택한 일정 달력에 보여주기 위해 고를때 변수에 담아주기
const selectSchedule=()=>{
    const selectSchedules = document.getElementById("selectSchedule");

    let selectValue = selectSchedules.options[selectSchedules.selectedIndex].textContent;
    schedule = selectValue;
}

// 일정 삭제 요청
function scheduleRemove (event) {
    const date = event.target.id;

    $.ajax({
        type: "DELETE",
        url: "http://localhost:3000/calendar/deleteSchedule",
        data: { date },
        success: function (response) {
            location.reload();
        }
    })
}

// 코디 사진 삭제 요청
function codyRemove (event) {
    var date = event.target.id;
    date = date.slice(0, 10);
    console.log(date);

    $.ajax({
        type: "DELETE",
        url: "http://localhost:3000/calendar/deleteCody",
        data: { date },
        success: function (response) {
            location.reload();
        }
    })
}

// Dates 삭제 이벤트 리스너
var date_btns = document.querySelectorAll(".schedule_remove_btn");

date_btns.forEach( btn => {
    btn.addEventListener('click', scheduleRemove);
});

// 코디 이미지 삭제 이벤트 리스너
var cody_btns = document.querySelectorAll(".cody_remove_btn");

cody_btns.forEach( btn => {
    btn.addEventListener('click', codyRemove);
});

// 캘린더 css
$(function() {
    $(".schedule_remove_btn").css({
        "display": "none",
        "margin-left": "5px",
        "border": "none",
        "border-radius": "15px",
        "background-color": "#a3ddcbaf"
    });

    $(".cody_remove_btn").css({
        "display": "none",
        "margin-left": "5px",
        "border": "none",
        "border-radius": "15px",
        "background-color": "#a3ddcbaf"
    });
})


// 일정 삭제 버튼 hover css
$(".schedule_remove_btn").on({
    "mouseover": function() {
        $(this).css({ "opacity" : "0.5" });
    },
    "mouseout": function() {
        $(this).css({ "opacity" : "1" });
    }
});

// 일정 hover css
$(".schedule-box").on({
    "mouseover": function() {
        $(".schedule_remove_btn").css({ "display": "block" });
    },
    "mouseout": function() {
        $(".schedule_remove_btn").css({ "display": "none" });
    }
});

// 코디 삭제 버튼 hover css
$(".cody_remove_btn").on({
    "mouseover": function() {
        $(this).css({ "opacity" : "0.5" });
    },
    "mouseout": function() {
        $(this).css({ "opacity" : "1" });
    }
});

// 코디 hover css
$(".cody-box").on({
    "mouseover": function() {
        $(".cody_remove_btn").css({ "display": "block" });
    },
    "mouseout": function() {
        $(".cody_remove_btn").css({ "display": "none" });
    }
});




// 코디 사진 추가를 위한 팝업
function show2 () {
    document.querySelector(".background2").className = "background2 show2";
}

function close2 () { 
    document.querySelector(".background2").className = "background2";
}

function add2 () { 
    // 선택한 날짜 가져오기
    const date = document.getElementById('date-input2').value;
    // let day = date.split("-");
    console.log("년도!!!!!!"+day[0]);

    /*
    if(day[1].slice(0, 1) === '0') {
        day[1] = day[1].slice(1);
    }

    if(day[2].slice(0, 1) === '0') {
        day[2] = day[2].slice(1);
    }
    */

    // 선택한 이미지 캘린더에 보여주기!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // document.getElementById(day[0] + '-' + day[1] + '-' + day[2] + 'cody').src = fileReader.result;

    // 코디 사진 등록 팝업에서 선택된 내용들 초기화
    document.getElementById('date-input2').value = null;
    document.getElementById('fileUpload2').value = "";
    document.getElementById("previewImg2").src = "";

    document.querySelector(".background2").className = "background2";
}

document.querySelector("#show2").addEventListener('click', show2);
document.querySelector("#close2").addEventListener('click', close2);
document.querySelector("#add2").addEventListener('click', add2);

// 선택한 이미지 보여주기
const fileInput = document.getElementById("fileUpload2");

let fileReader;
const handleFiles = (e) => {
    const selectedFile = [...fileInput.files];
    //const fileReader = new FileReader();
    fileReader = new FileReader();

    fileReader.readAsDataURL(selectedFile[0]);

    fileReader.onload = function () {
        document.getElementById("previewImg2").src = fileReader.result;
    };
};

fileInput.addEventListener("change", handleFiles);

// selectSchedule=()=>{
//     // 선택한 일정 달력에 보여주기 위해 고를때 변수에 담아주기
//     const selectSchedules = document.getElementById("selectSchedule");

//     let selectValue = selectSchedules.options[selectSchedules.selectedIndex].textContent;
//     schedule = selectValue;
//     console.log(selectValue);
// }




// 백에 데이터 요청
// calendar 눌렀을 떄
$(document).ready(function() {
    $("#calendar").click(getSchedule); // 전체 일정
    $("#calendar").click(getCody); // 전체 코디 사진
    $("#calendar").click(getRecentSchedule); // 최근 일정
    $("#calendar").click(getScheduleMycloset); // 마이클로젯 기반 추천
    $("#calendar").click(getScheduleCrawling); // 크롤링 추천

    $("#add").click(getSchedule); // '일정 추가' 눌렀을 때
    $("#add2").click(getCody); // '코디 추가' 눌렀을 때

    getSchedule();
    getCody();
    getRecentSchedule();
    getScheduleMycloset();
    getScheduleCrawling();
});

function getSchedule() { // 전체 일정
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/calendar/getSchedule",
        data: {},
        success: function (response) {
            for(var i=0; i<response.length; i++) {
                document.getElementById(response[i]['date'] + 'schedule').textContent = response[i]['schedule_type'];
                document.getElementById(response[i]['date']).textContent = 'x';

/*                 $(function() {
                    $(`.${response[i]['date']}`).css({
                        "background-color": "#a3ddcbaf"
                    });
                }) */
            }
        }
    })
}

function getCody() { // 전체 코디 사진
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/calendar/getCody",
        data: {},
        success: function (response) {
            for(var i=0; i<response.length; i++) {
                const RELATIVE_PATH = '../public/images/calendar/';

                document.getElementById(response[i]['date'] + 'cody').src = RELATIVE_PATH + response[i]['image_path'];
                document.getElementById(response[i]['date'] + 'codyimg').textContent = 'x';

/*                 $(function() {
                    $(`.${response[i]['date']}`).css({
                        "background-color": "#a3ddcbaf"
                    });
                }) */
            }
        }
    })
}

function getRecentSchedule() { // 최근 일정
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/calendar/getRecentSchedule",
        data: {},
        success: function (response) {
            document.getElementById("schedule-recommend-ment2-schedule").textContent = '다음 일정은 ' + response[0]['schedule_type'] + ' 입니다.';
        }
    })
}


// 최근 일정 기반 추천
function getScheduleMycloset() { // 마이클로젯 기반 추천
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/calendar/getScheduleMycloset",
        data: {},
        success: function (response) {
            const RELATIVE_PATH = '../public/images/';
            let image_array = response['img'];

            for(var i=0; i<image_array.length; i++){
                document.getElementById("calendar-recommend-mycloset" + String(i + 1)).src = RELATIVE_PATH + image_array[i]['image'];
            }
        }
    })
}

function getScheduleCrawling() { // 크롤링 추천
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/calendar/getScheduleCrawling",
        data: {},
        success: function (response) {
            const res = response;
            for(var i=0; i<res.length; i++) {
                document.getElementById("calendar-recommend-link" + String(i + 1)).href = res[i]['url']; // 크롤링 링v크
                document.getElementById("calendar-recommend-img" + String(i + 1)).src = res[i]['imageurl']; // 크롤링 이미지 출력
                document.getElementById("calendar_clothes_price" + String(i + 1)).textContent = res[i]['price'] + ' won'; // 크롤링 가격 출력
            }



            // 일정 기반 추천 크롤링
            // //scheduleCrawling(response);

            // for(var i=0; i<2; i++){
            //     document.getElementById("calendar-recommend-first-link-" + (i + 1)).href = response[i];
            //     document.getElementById("calendar-recommend-first-img-" + (i + 1)).src = response[i];
            // }

            // for(var i=0; i<2; i++){
            //     document.getElementById("calendar-recommend-second-link-" + (i + 1)).href = response[i];
            //     document.getElementById("calendar-recommend-second-img-" + (i + 1)).src = response[i];
            // }

            // for(var i=0; i<2; i++){
            //     document.getElementById("calendar-recommend-third-link-" + (i + 1)).href = response[i];
            //     document.getElementById("calendar-recommend-third-img-" + (i + 1)).src = response[i];
            // }

            // for(var i=0; i<2; i++){
            //     document.getElementById("calendar-recommend-fourth-link-" + (i + 1)).href = response[i];
            //     document.getElementById("calendar-recommend-fourth-img-" + (i + 1)).src = response[i];
            // }
        }
    })
}

/*
// 일정 기반 추천 크롤링
function scheduleCrawling (response) {
    const min = '0';
    const max = response['price_max'];

    const keyword = response['recommends'];
    //네이버 쇼핑 링크 4개
    let url_arr = [];
    //상품 링크 8개
    const product_urls = [];
    //상품 이미지 url 8개
    const product_images = [];
    //상품 가격 8개
    const product_prices = [];


    for(var i=0; i<1; i++) {
        console.log(keyword[i]);
        url_arr.push('https://www.coupang.com/np/search?rocketAll=false&q='+ keyword[i] +'&brand=&offerCondition=&filter=&availableDeliveryFilter=&filterType=&isPriceRange=false&priceRange=' + min + '&minPrice=' + min + '&maxPrice=' + max + '&page=1&trcid=&traid=&filterSetByUser=true&channel=user&backgroundColor=&searchProductCount=990946&component=&rating=0&sorter=scoreDesc&listSize=36');
        $.ajax({
            url: 'https://www.coupang.com/np/search?rocketAll=false&q='+ keyword[i] +'&brand=&offerCondition=&filter=&availableDeliveryFilter=&filterType=&isPriceRange=false&priceRange=' + min + '&minPrice=' + min + '&maxPrice=' + max + '&page=1&trcid=&traid=&filterSetByUser=true&channel=user&backgroundColor=&searchProductCount=990946&component=&rating=0&sorter=scoreDesc&listSize=36',
        }).done(function(data) {
            // 크롤링 전체
            let html = data;
            console.log(html);
            // <a target="_blank" class="thumbnail_thumb__Bxb6Z" rel="noopener" data-nclick="N=a:lst*A.image,r:


            


            // i-1번째 상품링크 가져오기
            let temp_tag_index = html.indexOf('<img class="search-product-wrap-img"');
            let start_tag_index =  html.indexOf('href', temp_tag_index);
            let finish_tag_index = html.indexOf('">', start_tag_index);
            let image_url = html.slice(start_tag_index+6, finish_tag_index);
            product_urls.push(image_url);


            //i-1번째 상품 이미지 url 가져오기
            let product_start_index = html.indexOf('src=', temp_tag_index);
            let product_finish_index = html.indexOf('">', (product_start_index + 5));
            let product_image = html.slice(product_start_index+5, product_finish_index);
            product_images.push(product_image);

            //i-1번째 가격 정보 가져오기
            let price_start_index = html.indexOf('SEARCH_PRODUCT_PRICE">', product_finish_index);
            let price_finish_index = html.indexOf('</span>', price_start_index);
            let product_price = html.slice(product_start_index+22, price_finish_index);
            product_prices.push(product_price);
            /*-------------------------------------------------------------

            // i-2번째 상품링크 가져오기
            let temp_tag_index2 = html.indexOf('class="thumbnail_thumb__Bxb6Z"', finish_tag_index);
            let start_tag_index2 =  html.indexOf('href', temp_tag_index2);
            let finish_tag_index2 =  html.indexOf('">', start_tag_index2);
            let image_url2 = html.slice(start_tag_index2+6, finish_tag_index2);
            product_urls.push(image_url2);

            //i-2번째 상품 이미지 url 가져오기
            let product_start_index2 = html.indexOf('src=', temp_tag_index2);
            let product_finish_index2 = html.indexOf('">', (product_start_index2 + 5));
            let product_image2 = html.slice(product_start_index2+5, product_finish_index2);
            product_images.push(product_image2);

            //i-2번째 가격 정보 가져오기
            let price_start_index2 = html.indexOf('SEARCH_PRODUCT_PRICE">', product_finish_index2);
            let price_finish_index2 = html.indexOf('</span>', price_start_index2);
            let product_price2 = html.slice(product_start_index+22, price_finish_index2);
            product_prices.push(product_price2);

            // console.log(product_images);
            // console.log(product_price);


            // 의류 이미지 url


            // 의류 가격



            // document.getElementById("calendar-weather-loaction").textContent = location_name + ' 의 날씨';
            // document.getElementById("calendar-weather-loaction").textContent = location_name + ' 의 날씨';
            // document.getElementById("calendar-weather-loaction").textContent = location_name + ' 의 날씨';
            });
    }
    console.log(url_arr);
}
*/


/*
//네이버 날씨 크롤링
const axios = require("axios");
const cheerio = require("cheerio");

//axios를 활용해 AJAX로 HTML문서를 가져오는 함수 구현
async function getHtml () {
    try {
        return await get('https://www.coupang.com/np/search?q=%EA%B2%80%EC%A0%95%20%ED%9B%84%EB%93%9C%ED%8B%B0&channel=recent');
    } catch (error) {
    console.error(error);
    }
};

getHtml()
    .then(html => {
        let ulList = [];
        const $ = load(html.data);
        const $bodyList = $("li.search-product ")

        console.log("크롤링 전체: " + $bodyList);

        $bodyList.each(function(i, elem) {
            ulList[i] = {
                shop_href : $(this).find('a.search-product-link').attr('href'),
                img_src: $(this).find('img.search-product-wrap-img').attr('src'),
                price: $(this).find('strong.price-value').text()
            };
            console.log(ulList[i]);
        });

        // const data = ulList.filter(n => n.temperature);
        // return data[0];
    })
    .then(res => {
        // if (typeof document !== "undefined") {
            // console.log(res[0]);
            // document.getElementById("calendar-weather-loaction").textContent = res[0];
            // document.getElementById("calendar-weather-etc").textContent = res[1];
            // document.getElementById("calendar-weather-temp").textContent = res[1];
        // }
    });
*/



// 날씨 크롤링
$.ajax({
    url: "https://weather.naver.com/",
}).done(function(data) {
    // 크롤링 전체
    const html_weather = data;

    // 위치
    // 시작 태그 인덱스
    let start_tag_index = html_weather.indexOf('<strong class="location_name">');
    let start_tag_len = ('<strong class="location_name">').length;
    let middle_tag_index = start_tag_index + start_tag_len;

    let middle = html_weather.slice(middle_tag_index);

    // 끝 태그 인덱스
    let end_tag_index = middle.indexOf('</strong>');
    let location_name = middle.slice(0, end_tag_index);


    // 온도
    start_tag_index = html_weather.indexOf('<span class="blind">현재 온도</span>');
    start_tag_len = ('<span class="blind">현재 온도</span>').length;
    middle_tag_index = start_tag_index + start_tag_len;

    middle = html_weather.slice(middle_tag_index);

    end_tag_index = middle.indexOf('<span class="degree">°</span>');
    let weather_temp = middle.slice(0, end_tag_index);


    // etc
    start_tag_index = html_weather.indexOf('<span class="weather">');
    start_tag_len = ('<span class="weather">').length;
    middle_tag_index = start_tag_index + start_tag_len;

    middle = html_weather.slice(middle_tag_index);

    end_tag_index = middle.indexOf('</span>');
    let weather_etc = middle.slice(0, end_tag_index);


    document.getElementById("calendar-weather-loaction").textContent = location_name + ' 의 날씨';
    document.getElementById("calendar-weather-temp").textContent = weather_temp + '°';
    document.getElementById("calendar-weather-etc").textContent = weather_etc;
});