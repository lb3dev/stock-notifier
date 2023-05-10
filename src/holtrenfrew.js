const Base = require('./base');

class Holt extends Base {

    constructor(url, threshold) {
        super();
        this.url = url;
        this.threshold = threshold;
    }

    async check() {
        const title = await this.page.locator('h1.product-details__name');
        this.title = await title.innerText();

        this.onSale = (await this.page.locator('span.product-details__price--sale[data-current-price="true"]').count()) > 0;

        if (this.onSale) {
            const elem = (await this.page.locator('span.product-details__price--sale[data-current-price="true"]'));
            const price = (await elem.locator('xpath=child::*').innerText());
            this.price = parseFloat(price.replace('$', '').trim());
        } else {
            const elem = (await this.page.locator('div.product-details__price'));
            const price = (await elem.locator('xpath=child::*').innerText());
            this.price = parseFloat(price.replace('$', '').trim());
        }

        const addToCart = await this.page.locator('#addToCartButton');
        this.inStock = (await addToCart.getAttribute('disabled')) === null;

        if (this.inStock) {
            this.hit = this.price <= this.threshold;
        }

        this.row();
    }
}

async function run(config) {
    return await new Holt(config.url, config.threshold).run();
}

module.exports = {
    run: run
};