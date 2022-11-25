//옷 색상 15개 : 
/*
let clothes_color_code_to_korean = {
    'red' : '빨간색', 'orange' : '주황색', 'yellow' : '노랑색',
    'lightgreen' : '카키색', 'green' : '초록색', 'skyblue' : '파란색',
    'navy' : '남색', 'gray' : '회색', 'black' : '검은색',
    'white' : '흰색', 'brown' : '갈색', 'purple' : '보라',
    'pink' : '분홍', 'ivory' : '아이보리'
}

//옷 종류 25개 : 
let clothes_type_code_to_korean = {
    'a' : '민소매', 'b' : '반팔티셔츠', 'c' : '긴팔티셔츠', 'd' : '후드티', 'e' : '긴블라우스',
    'f' : '반팔블라우스', 'g' : '반바지', 'h' : '청바지', 'J_' : '조거팬츠', 'k' : '슬랙스',
    'l' : '롱스커트', 'n' : '정장스커트', 'm' : '미니스커트', 'o' : '롱원피스', 'p' : '숏원피스',
    'q' : '짧은점프슈트', 'r' : '긴점프슈트', 's' : '코트', 't' : '가디건', 'u' : '패딩',
    'v' : '자켓', 'w' : '셔츠', 'W_' : '체크셔츠', 'x' : '조끼', 'y' : '점퍼'
}

var kor_keyword = []
*/

// 네이버 쇼핑 크롤링
/*
import { get } from "axios";
import { load } from "cheerio";

const getHtml = async () => {
    try {
        keyword = '%EC%B2%AD%EB%B0%94%EC%A7%80';
        min = '10000';
        max = '50000';
        return await get('https://search.shopping.naver.com/search/all?frm=NVSHPRC&maxPrice=' + max + '&minPrice=' + min + '&origQuery=' + keyword + '&pagingIndex=1&pagingSize=40&productSet=total&query=%EC%B2%AD%EB%B0%94%EC%A7%80&sort=rel&timestamp=&viewType=list');
    } catch (error) {
    console.error(error);
    }
};


getHtml()
    .then(html => {
        let ulList = [];
        const $ = load(html.data);
        const $bodyList = $("ul.list_basis li")//.children("div")

        $bodyList.each(function(i, elem) {
            // console.log(elem);
            ulList[i] = {
                title: $(this).find('a.basicList_link__JLQJf').attr('title'),
                url: $(this).find('a.basicList_link__JLQJf').attr('href'),
                image_url: $(this).find('a.thumbnail_thumb__Bxb6Z img').attr('src'),
                price: $(this).find('span.price_num__S2p_v').text()
            };
        });

        const data = ulList.filter(n => n.title);
        return data;
    })
    .then(res => {
        // document.querySelector('#test').innerHTML = res[0].url;
        console.log(res[0].url);
        // 크롤링 결과 화면에 출력
        if (typeof document !== "undefined") {
            document.getElementById("test").href = res[0].url;
            console.log(res[0].url);
        }

        console.log(res);
    });
*/


// 백에 데이터 요청    
// shop 눌렀을 때, 로딩시
$(document).ready(function() {
    $("#shop").click(recommend_crawling);
    $("#shop").click(recommend_mycloset);
    
    recommend_crawling();
    recommend_mycloset();
});

// 취향 기반 추천 리스트 요청
function recommend_crawling() {
    $.ajax({
            type: "GET",
            url: "http://localhost:3000/shop/recommendationlist",
            data: {},
            success: function (response) {
                const res = response;
                for(var i=0; i<res.length; i++) {
                    console.log()
                    document.getElementById("shop-recommend-url" + String(i + 1)).href = res[i]['url']; // 크롤링 쇼핑 링킹
                    document.getElementById("shop-recommend-img" + String(i + 1)).src = res[i]['imageurl']; // 크롤링 이미지 출력
                    document.getElementById("shop_clothes_price" + String(i + 1)).textContent = res[i]['price'] + ' won'; // 크롤링 가격 출력
                }
                /*
                for(var i=0 ; i<8 ; i++){
                    var en_keyword = response['recommend_list'][i];
                    if(en_keyword[0] == 'J' || en_keyword[0]=='W'){
                        var kor_type = clothes_type_code_to_korean[en_keyword.slice(0, 2)];
                        var kor_color = clothes_color_code_to_korean[en_keyword.slice(2)];
                        kor_keyword.push(kor_color + ' ' + kor_type);
                    }
                    else {
                        var kor_type = clothes_type_code_to_korean[en_keyword[0]];
                        var kor_color = clothes_color_code_to_korean[en_keyword.slice(1)];
                        kor_keyword.push(kor_color + ' ' + kor_type);
                    }
                }
                console.log(kor_keyword);
                */
            }
    })
};

// 옷장 기반 추천 리스트 요청
function recommend_mycloset() {
    $.ajax({
            type: "GET",
            url: "http://localhost:3000/shop/findfrommycloset",
            data: {},
            success: function (response) {
                const RELATIVE_PATH = '../public/images/';

                let mycloset_array = response[0];
                let mycloset_address_array = [];
                
                for(var i=0; i<mycloset_array.length; i++) {
                    let image_address = RELATIVE_PATH + mycloset_array[i]['image'];
                    mycloset_address_array.push(image_address);
                }

                for(var i=0; i<mycloset_address_array.length; i++) {
                    document.getElementById("shop_mycloset" + String(i+1)).src = mycloset_address_array[i];
                }
            }
    })
};


// document.querySelector("#shop-recommend-first-1").addEventListener('click', getHtml);