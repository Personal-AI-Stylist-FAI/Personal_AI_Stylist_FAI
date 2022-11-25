// 이미지 상대 경로
const RELATIVE_PATH = '../public/images/calendar/';

// 페이지 로딩/home 클릭시 백에게 요청
$(document).ready(function() {
     $("#home").click(getSchedules);
     $("#home").click(getMyClosets);

     getMyClosets();
     getSchedules();
});

function getMyClosets() { // 최근 마이클로젯 등록 의류 9개
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/getRecent9",
        data: {},
        success: function (response) {
            const RELATIVE_PATH = '../public/images/';

            let mycloset_address_array = [];

            for(var i=0; i<response.length; i++) {
                image_address = RELATIVE_PATH + response[i]['img'];
                mycloset_address_array.push(image_address);
            }

            for(var i=0; i<mycloset_address_array.length; i++) {
                document.getElementById("index_mycloset" + String(i+1)).src = mycloset_address_array[i];
                document.getElementById("index_clothes_type" + String(i+1)).textContent = response[i]['type'];
                if(response[i]['class'].slice(0, 1) == 'W') {
                    document.getElementById("index_clothes_color" + String(i+1)).textContent = response[i]['class'].slice(2);    
                }
                else {
                    document.getElementById("index_clothes_color" + String(i+1)).textContent = response[i]['class'].slice(1);
                }
                // document.getElementById("index_clothes_color" + String(i+1)).textContent = response[i]['class'].slice(1);
            }
        }
    })
}

function getSchedules() { // 사용자 이름/최근 일정 날짜, 종류/최근 등록 코디 사진
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/get4Info",
        data: {},
        success: function (response) {
            document.getElementById("username").textContent = response['user_name'];
            document.getElementById("nearestSched_date").textContent = "가장 가까운 일정은 " + response['nearestSched'][0]['date'];
            document.getElementById("nearestSched_type").textContent = response['nearestSched'][0]['schedule_type'] + " 입니다.";
            document.getElementById("nearestCodi").src = RELATIVE_PATH + response['nearestCodi'][0]['image_path'];
        }
    })
}




//네이버 날씨 크롤링
// const axios = require("axios");
// const cheerio = require("cheerio");

// import { get } from "axios";
// import { load } from "cheerio";

// import axios from 'axios';
// import cheerio from 'cheerio';

//axios를 활용해 AJAX로 HTML문서를 가져오는 함수 구현
/*
async function getHtml () {
    try {
        return await axios.get('https://weather.naver.com/');
        // return await get('https://weather.naver.com/');
    } catch (error) {
        console.error(error);
    }
};

getHtml()
    .then(html => {
        let ulList = [];
        const $ = cheerio.load(html.data);
        // const $ = load(html.data);
        const $bodyList = $("div.today_weather")

        $bodyList.each(function(i, elem) {
            ulList[i] = {
                location : $(this).find('strong.location_name').text(),
                temperature: $(this).find('strong.current').text().trim(),
                weather: $(this).find('span.weather').text()
            };
        });

        const data = ulList.filter(n => n.temperature);
        return data[0];
    })
    .then(res => {
        // if (typeof document !== "undefined") {
            console.log(res[0]);
            document.getElementById("calendar-weather-loaction").textContent = res[0];
            document.getElementById("calendar-weather-etc").textContent = res[1];
            document.getElementById("calendar-weather-temp").textContent = res[2];
            console.log(res);
        // }
    });
*/


// axios.get("https://weather.naver.com/")
//     .then((response) => {
//         console.log(response.data);
//     })


$.ajax({
	url: "https://weather.naver.com/",
}).done(function(data) {
    // 크롤링 전체
    const html_weather = data;
    // console.log(html_weather);

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


    document.getElementById("index-weather-location").textContent = location_name;
    document.getElementById("index-weather-temp").textContent = weather_temp + '°';
    document.getElementById("index-weather-etc").textContent = weather_etc + ', '  ;
});