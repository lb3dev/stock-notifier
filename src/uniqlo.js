const Base = require('./base');
const { chromium } = require('playwright');

class Uniqlo extends Base {

    constructor(url, threshold, colors) {
        super();
        this.url = url;
        this.threshold = threshold;
        this.colors = colors;
    }

    async checkColor(color) {
        this.hit = false;
        
        if (color) {
            await this.page.locator(`dt.color >> input[value="${color}"] + label`).click();
            this.url = await this.page.url();
        }

        const titleElem = await this.page.locator('#right >> div[data-test="product-name"] >> span.title');
        this.title = await titleElem.innerText();

        const addToCart = await this.page.locator('#right >> button[data-test="add-to-cart-button"]');
        this.inStock = (await addToCart.getAttribute('disabled')) === null;

        this.onSale = await this.page.locator('#right >> span.price-limited').isVisible();
        if (this.onSale) {
            const salePrice = await this.page.locator('#right >> span.price-limited >> span.fr-price-currency >> span');
            this.price = parseFloat(await salePrice.innerText());
        } else {
            const regularPrice = await this.page.locator('#right >> span.price-original >> span.fr-price-currency >> span');
            this.price = parseFloat(await regularPrice.innerText());
        }

        if (this.inStock) {
            this.hit = this.price <= this.threshold;
        }
        this.row();
    }

    async check() {
        await this.overlay();
        if (this.colors) {
            for (const color of this.colors) {
                await this.checkColor(color);
            }
        } else {
            await this.checkColor(null);
        }
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
    return await new Uniqlo(config.url, config.threshold, config.colors).run();
}

module.exports = {
    run: run
};