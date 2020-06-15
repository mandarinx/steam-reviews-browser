const history = {
	
	getItemKey(num) {
	    return `steam_review_search_${num}`;
	},

	get() {
	    let num_item = 0;
	    let history_items = [];

	    while (true) {
	        let item = window.localStorage.getItem(history.getItemKey(num_item));
	        if (item === null) {
	            return history_items;
	        }
	        num_item += 1;
	        history_items.push(item);
	    }
	},

	print(history_items, el) {
	    history_items.forEach((item, count) => {
	        el.insertAdjacentHTML('beforeend', `
	            <a href=${history.getItemUrl(item)}>${item}</a>
	        `);
	    });
	},

	getItemUrl(item) {
	    return `http://127.0.0.1:8000?${item}`;
	},

	append(appid, options) {
	    window.localStorage.setItem(
	        `steam_review_search_${window.history_count}`, 
	        `appid=${appid}`+
	        `&filter=${options.filter}`+
	        `&lang=${options.lang}`+
	        `&reviewtype=${options.review_type}`+
	        `&purchasetype=${options.purchase_type}`+
	        `&offset=${options.offset}`+
	        `&dayrange=${options.day_range}`+
	        `&numperpage=${options.num_per_page}`);
	},

	clear() {
        let num_item = 0;
        while (true) {
            let item_id = history.getItemKey(num_item);
            if (window.localStorage.getItem(item_id) === null) {
                break;
            }
            window.localStorage.removeItem(item_id);
            num_item += 1;
        }
	}
}

export default history;