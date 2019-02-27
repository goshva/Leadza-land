/* eslint camelcase: [2, {properties: "never"}] */
const state = {
    rates: [
        {
            name: 'Demo',
            spends: '<$9',
            checkSpend: avaliableSpend => avaliableSpend <= 9 ,
            hidden: true,
            limit: limit  => true,
            monthPricingStr: '$0',
            monthPricing: 0,
            yearPricing: 0
        },
        {
            name: 'Intern',
            spends: '<$5000',
            checkSpend: avaliableSpend => 9 < avaliableSpend <= 5000 ,
            hidden: false,
            limit: limit  => true,
            monthPricingStr: '$59/month',
            monthPricing: 59,
            yearPricing: 590
        },
        {
            name: 'Junior',
            spends: '<$25K',
            checkSpend: avaliableSpend => avaliableSpend <= 25000,
            hidden: false,
            limit: limit  => true,
            monthPricingStr: '$179/month',
            monthPricing: 179,
            yearPricing: 1790
        },
        {
            name: 'Expert',
            spends: '<$100K',
            checkSpend: avaliableSpend => avaliableSpend <= 100000,
            hidden: false,
            limit: limit  => true,
            monthPricingStr: '$379/month',
            monthPricing: 379,
            yearPricing: 3790
        },
        {
            name: 'Master',
            spends: '>$100K',
            checkSpend: avaliableSpend => true,
            hidden: false,
            limit: limit  => true,
            monthPricingStr: '$979/month',
            monthPricing: 979,
            yearPricing: 9790
        }
    ],
    selectedRate: null,
    ads: [ ]
};

//export default state;
