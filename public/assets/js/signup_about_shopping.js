// 백에 데이터 요청
$(document).ready(function() {
    $("#signup_about_shopping").click(getMypageData); // 마이페이지 눌렀을 때

    $("#signup_about_shopping_submit").click(getMypageData); // 마이페이지에서 '등록' 눌렀을 때

    getMypageData();
});

function getMypageData() { // 사용자 선호도
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/signup_about_shopping/mypagedata",
        data: {},
        success: function (response) {
            console.log(response[0]);

            let preferred_type_array = response[0]["preferred_type"];
            let preferred_color_array = response[0]["preferred_color"];
            let price_max = response[0]["price_max"];
            let shopping_term = response[0]["shopping_term"];
            let open_to_newstyle = response[0]["open_to_newstyle"];

            let color_array = ['brown', 'black', 'blue', 'gray', 'green', 'ivory', 'lightgreen', 'navy', 'orange', 'pink', 'purple', 'red', 'skyblue', 'white', 'yellow'];
            for(var i=0; i<color_array.length; i++) {
                let preferred_color_id = '#' + color_array[i] + '_preferred_color' + (preferred_color_array[color_array[i]]);
                $(preferred_color_id).prop('checked', true);
            }

            let type_array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'J_', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'W_', 'x', 'y'];
            for(var i=0; i<type_array.length; i++) {
                let preferred_type_id = '#' + type_array[i] + '_preferred_type' + (preferred_type_array[type_array[i]]);
                $(preferred_type_id).prop('checked', true);
            }

            let open_to_newstyle_id = '#open_to_newstyle' + open_to_newstyle;
            $(open_to_newstyle_id).prop('checked', true);

            let price_max_id = '#price_max' + price_max;
            $(price_max_id).prop('checked', true);

            let shopping_term_id = '#shopping_term' + shopping_term;
            $(shopping_term_id).prop('checked', true);
        }
    })
}