// Require express and body-parser
const express = require("express")
const bodyParser = require("body-parser")
const fs = requre = require("fs")
const { query, validationResult } = require('express-validator');

var institution1 = "institution1"
var institution2 = "institution2"


var institutions = [{institution1}, {institution2}];

// Initialize express and define a port
const app = express()
const PORT = 3080

// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json())


// Start express on the defined port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))


app.get("/get_campaign_total", [
    query('institution').exists().withMessage("institution is a required param").isIn(institutions).withMessage("not a supported institution"),
    query('campaign').exists().withMessage("campaign is a required param")
],async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
    var institution = req.query.institution;
    var campaign = req.query.campaign.toLowerCase();
    if (!fs.existsSync(`database/${institution}.json`)) {
        console.log("file dont exist")
        res.status(400).send("Institution DB does not exist")
    }
    else{
    
    let response = await getCampaignTotal(institution, campaign)
    if(campaign === "all"){
        res.send(response)
    }
    else
        res.send({"amount" : response});
    }
})


app.post("/add_external_donation",
[
    query('institution').exists().withMessage("institution is a required param").isIn(institutions).withMessage("not a supported institution"),
    query('campaign').exists().withMessage("campaign is a required param"),
    query('amount', "amount must be a number").exists().withMessage("amount is a required param").isInt()

],
 async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
    var institution = req.query.institution;
    var campaign = req.query.campaign.toLowerCase();
    var amount = req.query.amount;
    await addDonationAmount(institution, campaign, parseInt(amount))
    var logging = `added external donation for ${institution} into campaign ${campaign} in the amount of ${amount}`
    console.log(logging)
    res.status(200).send(logging)
})

app.post("/set_campaign_amount",
[
    query('institution').exists().withMessage("institution is a required param").isIn(institutions).withMessage("not a supported institution"),
    query('campaign').exists().withMessage("campaign is a required param"),
    query('amount', "amount must be a number").exists().withMessage("amount is a required param").isInt()

],
 async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
    var institution = req.query.institution;
    var campaign = req.query.campaign.toLowerCase();
    var amount = req.query.amount;
    await setCampaignAmount(institution, campaign, parseInt(amount))
    var logging = `set amount for ${institution} for campaign ${campaign} to the amount of ${amount}`
    console.log(logging)
    res.status(200).send(logging)
})


app.post(`/${institution1}_donation_webhook'`, (req, res) => {
    var amount = parseInt(req.body.data.total);
    var campaign = req.body.meta.name.toLowerCase();
    console.log(`recieved ${req.body.data.total} from ${req.body.data.billing.name.first} for ${campaign}`)
    addDonationAmount(institution1, campaign, amount)
    res.status(200).end() // Responding is important
})

app.post(`/${institution2}_donation_webhook`, (req, res) => {
    console.log(req.body)
    var amount = parseInt(req.body.data.total);
    var campaign = req.body.meta.name.toLowerCase();
    console.log(`recieved ${req.body.data.total} from ${req.body.data.billing.name.first} for ${campaign}`)
    addDonationAmount(institution2, campaign, amount)
    res.status(200).end() // Responding is important
})


async function getCampaignTotal(institution, campaign) {
    return new Promise((resolve, reject) => {
        fs.readFile(`database/${institution}.json`, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }
            db = JSON.parse(data);
            if(campaign === "all"){
                resolve(db)
            }
            else if (db.hasOwnProperty(campaign)) {
                resolve(db[campaign].total);
            }
            else {
                resolve(0);
            }
        })
    });
}

async function addDonationAmount(institution,campaign,amount){
    if (!fs.existsSync(`database/${institution}.json`)) {
        var dataToWrite = JSON.stringify({});
        try {
            fs.writeFileSync(`database/${institution}.json`, dataToWrite);
            console.log("JSON saved to " + `database/${institution}.json`);
        } catch (err) {
            return console.log(err);
        }
    }

    fs.readFile(`database/${institution}.json`, 'utf8', (err, data) => {
        if (err) {
            throw err;
        }
        JSONDatabase = JSON.parse(data);
        if (JSONDatabase.hasOwnProperty(campaign)) {
            JSONDatabase[campaign].total += amount;
        }
        else {
            JSONDatabase[campaign] = { "total": amount }
        }

        fs.writeFile(`database/${institution}.json`, JSON.stringify(JSONDatabase), (err) => {
            if (err) console.log('Error writing file:', err)
        })

        console.log(`the total for the campaign ${campaign} is now ${JSONDatabase[campaign].total}`)
    })

}

async function setCampaignAmount(institution,campaign,amount){
    if (!fs.existsSync(`database/${institution}.json`)) {
        var dataToWrite = JSON.stringify({});
        try {
            fs.writeFileSync(`database/${institution}.json`, dataToWrite);
            console.log("JSON saved to " + `database/${institution}.json`);
        } catch (err) {
            return console.log(err);
        }
    }

    fs.readFile(`database/${institution}.json`, 'utf8', (err, data) => {
        if (err) {
            throw err;
        }
        JSONDatabase = JSON.parse(data);
        if (JSONDatabase.hasOwnProperty(campaign)) {
            JSONDatabase[campaign].total = amount;
        }
        else {
            JSONDatabase[campaign] = { "total": amount }
        }

        fs.writeFile(`database/${institution}.json`, JSON.stringify(JSONDatabase), (err) => {
            if (err) console.log('Error writing file:', err)
        })

        console.log(`the total for the campaign ${campaign} is now ${JSONDatabase[campaign].total}`)
    })

}

const sanitizeLower = value => {
    return value.toLowerCase()
  }