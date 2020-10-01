const BillingCycle = require('../api/billing-cycle')
const errorHandler = require('../common/error-handler')

BillingCycle.methods(['get', 'post', 'put', 'delete'])
BillingCycle.updateOptions({new: true, runValidators: true})
BillingCycle.after('post', errorHandler).after('put', errorHandler)

BillingCycle.route('resume', (req, res) => {
    const query = BillingCycle.find({}).select({'name': 1, 'year': 2});

    query.exec((err, result) => {
        if (err) {
            res.status(500).json({errors: [err]})
        } else {
            res.status(200).send(result)
        }
    })
})

BillingCycle.route('summary', (req, res, next) => {
    const month = monthCurrent();
    BillingCycle.aggregate([
        {
            $match: {month}
        },
        {
            $project: {
                totalDebit: {$sum: "$debits.value"},
                totalCredit: {$sum: "$credits.value"}
            }
        },
        {
            $project: {_id: 0, totalDebit: 1, totalCredit: 1}
        }]).exec((error, result) => {
        if (error) {
            res.status(500).json({errors: [error]})
        } else {
            res.json(result[0] || {totalDebit: 0, totalCredit: 0})
        }
    })
})

BillingCycle.route('summary-shared', (req, res, next) => {
    const month = monthCurrent()
    BillingCycle.aggregate([
        {
            $match: {month}
        },
        {
            $addFields: {
                debits: {
                    $filter: {
                        input: "$debits",
                        as: "d",
                        cond: {
                            $eq: ["$$d.hasSplit", true]
                        }
                    }
                }
            }
        },
        {
            $group: {_id: null, subTotalDebit: {$sum: {$sum: "$debits.value"}}}
        },
        {
            $project: {_id: 0, subTotalDebit: 1}
        }]).exec((error, result) => {
        if (error) {
            res.status(500).json({errors: [error]})
        } else {
            res.json(result[0] || {subTotalDebit: 0})
        }
    })
})

BillingCycle.route('summary-individual-by-person', (req, res, next) => {
    const month = monthCurrent()
    const responsibleName = req.query.responsibleName || ''
    BillingCycle.aggregate([
        {
            $match: { month }
        },
        {
            $unwind: "$debits"
        },
        {
            $match: {"debits.responsibleName": responsibleName }
        },
        {
            $group: { _id: null, totalIndividual: {$sum: {$sum: "$debits.value"}} }
        },
        {
            $project: {_id: 0, totalIndividual: 1}
        }
    ]).exec((error, result) => {
        if (error) {
            res.status(500).json({errors: [error]})
        } else {
            res.json(result[0] || {totalIndividual: 0})
        }
    })
})

BillingCycle.route('count', (req, res, next) => {
    BillingCycle.count((error, value) => {
        if (error) {
            res.status(500).json({errors: [error]})
        } else {
            res.json({value})
        }
    })
})

function monthCurrent() {
    return new Date().getMonth() + 1;
}

module.exports = BillingCycle
