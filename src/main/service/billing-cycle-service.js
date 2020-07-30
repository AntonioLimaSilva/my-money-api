const billingCycle = require('../api/billing-cycle')
const errorHandler = require('../common/error-handler')

billingCycle.methods(['get', 'post', 'put', 'delete'])
billingCycle.updateOptions({new: true, runValidators: true})
billingCycle.after('post', errorHandler).after('put', errorHandler)

billingCycle.route('summary', (req, res, next) => {
    billingCycle.aggregate({
        $project: {totalCredit: {$sum: "$credits.value"}, totalDebit: {$sum: "$debits.value"}}
    }, {
        $group: {_id: null, totalCredit: {$sum: "$totalCredit"}, totalDebit: {$sum: "$totalDebit"}}
    }, {
        $project: {_id: 0, totalCredit: 1, totalDebit: 1}
    }, (error, result) => {
        if(error) {
            res.status(500).json({errors: [error]})
        } else {
            res.json(result[0] || { credit: 0, debit: 0 })
        }
    })
})

billingCycle.route('summary-shared', (req, res, next) => {
    billingCycle.aggregate([{
        $project: {
            subTotalDebit: {
                $sum: { 
                    $map: {
                        input: "$debits",
                        as: "item",
                        in: {
                            $cond: [
                                {$eq: ["$$item.hasSplit", true]},
                                "$$item.value", 0
                            ]
                        }
                    }               
                }
            }
        }
    }, 
    {   
        $project: {_id: 0, subTotalDebit: 1}
    }], (error, result) => {
        if(error) {
            res.status(500).json({errors: [error]})
        } else {
            res.json(result[0] || { debits: 0 })
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
