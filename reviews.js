import bbCodeParser from './node_modules/js-bbcode-parser/src/simple.js';

// CORS proxy https://github.com/Rob--W/cors-anywhere/
// git clone https://github.com/Rob--W/cors-anywhere.git
// cd cors-anywhere/
// npm install
// heroku create
// git push heroku master

const reviews = {

    get(appid, cursor, options, progress, done, result) {
        var url = getBaseUrl(appid);
        url = appendCursor(url, cursor);
        url = appendOptions(url, options);
        console.log(url);

        if (typeof result === 'undefined') {
            result = {
                reviews: [],
                summary: {},
            };
        }

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    console.error('Response not OK');
                    return;
                }
                response.json().then(data => {
                    console.log(data);

                    if (typeof data.query_summary.review_score !== 'undefined') {
                        result.summary = {
                            review_score: data.query_summary.review_score,
                            review_score_desc: data.query_summary.review_score_desc,
                            total_positive: data.query_summary.total_positive,
                            total_negative: data.query_summary.total_negative,
                            total_reviews: data.query_summary.total_reviews,
                        };
                    }

                    progress({
                        total_pages: result.summary.total_reviews == 0
                            ? '?' 
                            : Math.ceil(result.summary.total_reviews / options.num_per_page),
                        page: parseInt(options.offset) + 1
                    });

                    result.reviews = result.reviews.concat(data.reviews);
                    
                    if (data.reviews.length === 0) {
                        done(result);
                        return;
                    }
                    
                    options.offset = parseInt(options.offset) + 1;
                    
                    reviews.get(appid, data.cursor, options, progress, done, result);
                });
            })
            .catch(() => {
                console.log(`Can't access ${url}`);
            });
    },

    printResults(result, el) {
        const nlregex = /\n/gmi;
        result.reviews.forEach((res, count) => {
            el.insertAdjacentHTML('beforeend', `
                <div class="review">
                    <div class="review_head ${res.voted_up ? '' : 'dislike'}">
                        <img src="${res.voted_up 
                            ? `thumb-up.svg` 
                            : `thumb-down.svg`}" />
                        <dl>
                            <dt>Author</dt>
                            <dd>${res.author.steamid}</dd>
                            <dt>Playtime</dt>
                            <dd>${Math.round((res.author.playtime_forever / 60) * 10) / 10} hours</dd>
                        </dl>
                    </div>
                    <div class="review_body">${bbCodeParser.parse(res.review.replace(nlregex, '<br/>'))}</div>
                </div>
            `);
        });
    },

    printSummary(result, el) {
        el.insertAdjacentHTML('afterbegin', `
            <dl>
                <dt>Review score</dt>
                <dd>${result.summary.review_score_desc} (${result.summary.review_score})</dd>
                <dt>Total positive</dt>
                <dd>${result.summary.total_positive}</dd>
                <dt>Total negative</dt>
                <dd>${result.summary.total_negative}</dd>
                <dt>Total reviews</dt>
                <dd>${result.summary.total_reviews}</dd>
            </dl>
        `);
    }
}

function getBaseUrl(appid) {
    const proxyurl = "https://pacific-anchorage-38173.herokuapp.com/";
    return `${proxyurl}https://store.steampowered.com/appreviews/${appid}?json=1`;
}

function appendCursor(url, cursor) {
    cursor = cursor === '*' ? cursor : encodeURIComponent(cursor);
    return `${url}&cursor=${cursor}`;
}

function appendOptions(url, options) {
    url = appendFilter(url, options.filter);
    url = appendLanguage(url, options.language);
    url = appendReviewType(url, options.review_type);
    url = appendPurchaseType(url, options.purchase_type);
    url = appendOffset(url, options.offset);
    url = appendDayRange(url, options.day_range);
    url = appendNumPerPage(url, options.num_per_page);
    return url;
}

function appendLanguage(url, lang) {
    return `${url}&language=${lang}`;
}

function appendFilter(url, filter) {
    return `${url}&filter=${filter}`;
}

function appendReviewType(url, reviewType) {
    return `${url}&review_type=${reviewType}`;
}

function appendPurchaseType(url, purchaseType) {
    return `${url}&purchase_type=${purchaseType}`;
}

function appendOffset(url, offset) {
    return `${url}&start_offset=${offset}`;
}

function appendDayRange(url, dayRange) {
    return `${url}&day_range=${dayRange}`;
}

function appendNumPerPage(url, numPerPage) {
    return `${url}&num_per_page=${numPerPage}`;
}

export default reviews;
