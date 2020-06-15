import reviews from './reviews.js';
import history from './history.js';

function getSelectValue(id) {
    let el = document.getElementById(id);
    return el.options[el.selectedIndex].value;
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function getReviews(appid, options) {
    document.getElementById('reviews').innerHTML = '';
    document.getElementById('log').innerHTML = '';
    document.getElementById('summary').innerHTML = '';
    
    reviews.get(appid, '*', options, 
        (progress) => {
            document.getElementById('log').textContent = `Downloaded page ${progress.page} of ${progress.total_pages}`;
        },
        (result) => {
            reviews.printResults(result, document.getElementById('reviews'));
            reviews.printSummary(result, document.getElementById('summary'));
            updateHistory();

            let languages = {};
            result.reviews.forEach(r => {
                console.log(r.language);
                if (typeof languages[r.language] === 'undefined') {
                    languages[r.language] = 0;
                }
                languages[r.language] += 1;
            });

            Object.keys(languages).forEach(lang => {
                console.log(`${lang} : ${parseInt(languages[lang]) / result.reviews.length}`);
            });
            // document.getElementById('summary').insertAdjacentHTML('beforeend', 
            //     `${Object.keys(languages).forEach(lang => {
            //         `${lang} : ${parseInt(languages[lang]) / result.reviews.length}`
            //     })}`);
        });
}

function updateHistory() {
    let history_items = history.get();
    let elHistory = document.getElementById('history');
    window.history_count = history_items.length;
    elHistory.innerHTML = '';
    history.print(history_items, elHistory);
}

window.addEventListener('DOMContentLoaded', (event) => {

    document.getElementById('input_submit')
        .addEventListener('click', event => {

            let appid = document.getElementById('input_appid').value;
            let options = {
                filter:        getSelectValue('input_filter'),
                language:      getSelectValue('input_lang'),
                review_type:   getSelectValue('input_reviewtype'),
                purchase_type: getSelectValue('input_purchasetype'),
                offset:        0,
                day_range:     '9223372036854775807', // I don't know what this value represent
                num_per_page:  100
            };

            getReviews(appid, options);
            history.append(appid, options);
        });

    document.getElementById('history_clear')
        .addEventListener('click', event => {
            history.clear();
            updateHistory();
        });

    updateHistory();

    let appid = findGetParameter('appid');
    if (appid !== null) {
        let options = {
            filter:        findGetParameter('filter'),
            language:      findGetParameter('lang'),
            review_type:   findGetParameter('reviewtype'),
            purchase_type: findGetParameter('purchasetype'),
            offset:        findGetParameter('offset'),
            day_range:     findGetParameter('dayrange'),
            num_per_page:  findGetParameter('numperpage')
        };
        getReviews(appid, options);
    }
});
