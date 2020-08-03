const billingCycle = require('../api/billing-cycle')
const errorHandler = require('../common/error-handler')

billingCycle.methods(['get', 'post', 'put', 'delete'])
billingCycle.updateOptions({new: true, runValidators: true})
billingCycle.after('post', errorHandler).after('put', errorHandler)

billingCycle.route('summary', (req, res, next) => {
    billingCycle.aggregate([
        {
            $project: {
                totalDebit: { $sum: "$debits.value" },
                totalCredit: { $sum: "$credits.value" }
            }
        },
        {
            $project: {_id: 0, totalDebit: 1, totalCredit: 1}
        }], (error, result) => {
        if(error) {
            res.status(500).json({errors: [error]})
        } else {
            res.json(result[0] || { totalDebit: 0, totalCredit: 0 })
        }
    })
})

billingCycle.route('summary-shared', (req, res, next) => {
    billingCycle.aggregate([
        {
            $addFields: {
                debits: {
                    $filter: {
                        input: "$debits",
                        as: "d",
                        cond: {
                            $eq: [ "$$d.hasSplit", true ]
                        }
                    }
                }
            }
        },
        {
            $group: { _id: null, subTotalDebit: { $sum: { $sum: "$debits.value" } }}
        },
        {
            $project: {_id: 0, subTotalDebit: 1}
        }], (error, result) => {
        if(error) {
            res.status(500).json({errors: [error]})
        } else {
            res.json(result[0] || { subTotalDebit: 0 })
        }
    })
})

billingCycle.route('count', (req, res, next) => {
    billingCycle.count((error, value) => {
        if(error) {
            res.status(500).json({errors: [error]})
        } else {
            res.json({value})
        }
    })
})

module.exports = billingCycle
