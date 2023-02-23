const Base = require('./base');

class Converse extends Base {

    constructor(url, size, threshold) {
        super();
        this.url = url;
        this.size = size;
        this.threshold = threshold;
    }

    async check() {
        const title = await this.page.locator('div.display--title >> div.page-title-wrapper >> h1.page-title');
        this.title = await title.innerText();

        let addToCart = await this.page.locator('#product-addtocart-button');
        let attributes = await addToCart.getAttribute('class');
        if (!attributes.includes('outOfStock_button')) {
            await this.page.waitForSelector('div.product-options-wrapper >> div.swatch-attribute-options >> div.swatch-option', { state: 'visible' });
            for (const option of await this.page.locator('div.product-options-wrapper >> div.swatch-attribute-options >> div.swatch-option').all()) {
                const size = await option.getAttribute('data-option-label');
                const disabled = await option.getAttribute('disabled');
                if (disabled === null && size === this.size) {
                    this.inStock = true;
                    break;
                }
            }
        }

        if (this.inStock) {
            const price = await this.page.locator('div.product-info-main.amtheme-product-info >> span.normal-price >> span.price').innerText();
            this.onSale = (await this.page.locator('div.product-info-main.amtheme-product-info >> span.old-price').count()) > 0;
            this.price = parseFloat(price.replace('CA$', ''));
            this.hit = this.price <= this.threshold;
        }

        this.row();
    }
}

async function run(config) {
    return await new Converse(config.url, config.size, config.threshold).run();
}

module.exports = {
    run: run
};