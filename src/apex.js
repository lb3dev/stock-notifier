const Base = require('./base');

class Apex extends Base {

    constructor(url, threshold) {
        super();
        this.url = url;
        this.threshold = threshold;
    }

    async check() {
        const title = await this.page.locator('.product .product-title');
        this.title = await title.innerText();

        const addToCart = await this.page.locator('.product buy-buttons button.w-full');
        this.inStock = (await addToCart.getAttribute('disabled')) === null;

        const price = await this.page.locator('.product sale-price');
        let money = await price.innerText();
        money = money.replace('$', '').replace('CAD', '').replace('SALE PRICE', '').trim();
        this.price = parseFloat(money);

        this.onSale = (await this.page.locator('.product compare-at-price').count()) > 0;

        if (this.inStock) {
            this.hit = this.price <= this.threshold;
        }

        this.row();
    }
}

async function run(config) {
    return await new Apex(config.url, config.threshold).run();
}

module.exports = {
    run: run
};