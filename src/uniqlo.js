const Base = require('./base');
const { chromium } = require('playwright');

class Uniqlo extends Base {

    constructor(url, threshold) {
        super();
        this.url = url;
        this.threshold = threshold;
    }

    async check() {
        const titleElem = await this.page.locator('#right >> div[data-test="product-name"] >> span.title');
        this.title = await titleElem.innerText();

        const addToCart = await this.page.locator('#right >> button[data-test="add-to-cart-button"]');
        this.inStock = (await addToCart.getAttribute('disabled')) === null;

        if (this.inStock) {
            this.onSale = await this.page.locator('#right >> span.price-limited').isVisible();
            if (this.onSale) {
                const salePrice = await this.page.locator('#right >> span.price-limited >> span.fr-price-currency >> span');
                this.price = parseFloat(await salePrice.innerText());
            } else {
                const regularPrice = await this.page.locator('#right >> span.price-original >> span.fr-price-currency >> span');
                this.price = parseFloat(await regularPrice.innerText());
            }

            this.hit = this.price <= this.threshold;
        }

        this.row();
    }

    async overlay() {
        try {
            // Dismiss the initial visit frame
            const overlayFrame = await this.page.frameLocator('#attentive_creative');
            const dismiss = await overlayFrame.locator('#dismissbutton2');
            await dismiss.click();
        } catch (err) {
            console.log({ err });
        }
    }
}

async function run(config) {
    return await new Uniqlo(config.url, config.threshold).run();
}

module.exports = {
    run: run
};