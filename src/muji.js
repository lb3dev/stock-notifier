const Base = require('./base');

class Muji extends Base {

    constructor(url, size, threshold) {
        super();
        this.url = url;
        this.size = size;
        this.threshold = threshold;
    }

    async check() {
        const title = await this.page.locator('h1.product-title');
        this.title = await title.innerText();

        let price = await this.page.locator('div.price__current >> span.money').innerText();
        this.onSale = (await this.page.locator('span.product__badge--sale').count()) > 0;
        const onlineSale = (await this.page.locator('div.tdf_discountable_product').count()) > 0;
        this.price = parseFloat(price.replace('$', '').trim());

        if (onlineSale) {
            price = await this.page.locator('div.tdf_discountable_product >> span.tdf_price_sales >> span.money').innerText();
            this.price = parseFloat(price.replace('$', '').trim());
        }

        const selector = await this.page.locator('select.options-selection__input-select');
        const sizes = await selector.locator('option').all();

        for (const option of sizes) {
            const size = (await option.innerText()).trim();
            if (size === this.size) {
                await selector.selectOption({ 'value': size });
                const addToCart = await this.page.locator('div.product-form--atc >> button.product-form--atc-button');
                const disabled = await addToCart.getAttribute('disabled');
                if (disabled === null) {
                    this.inStock = true;
                    break;
                }
            }
        }

        if (this.inStock) {
            this.hit = this.price <= this.threshold;
        }

        this.row();
    }
}

async function run(config) {
    return await new Muji(config.url, config.size, config.threshold).run();
}

module.exports = {
    run: run
};