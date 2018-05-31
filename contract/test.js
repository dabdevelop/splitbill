

var BigNumber = require('bignumber.js');

var SplitBillItem = function(text) {
    this.parse(text);
};

SplitBillItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    },
    parse: function (text) {
        if (typeof text != "undefined") {
            var obj = JSON.parse(text);
            this.id = new BigNumber(obj.id);
            this.billName = obj.billName;
            this.receiverName = obj.receiverName;
            this.receiverAcc = obj.receiverAcc;
            this.initiatorName = obj.initiatorName;
            this.initiatorAcc = obj.initiatorAcc;
            this.amount = new BigNumber(obj.amount);
            this.splitNum = new BigNumber(obj.splitNum);
            this.billEach = new BigNumber(obj.billEach);
            this.paid = new BigNumber(obj.paid);
            this.paidNum = new BigNumber(obj.paidNum);

            this.paidAccs = {};
            var paidAccsData = obj.paidAccs;
            if(typeof paidAccsData != 'undefined'){
                for (var key in paidAccsData) {
                    this.paidAccs[key] = new BigNumber(paidAccsData[key]);
                }
            }

            this.paidAccMemos = obj.paidAccMemos;

            this.takenAccs = {};
            var takenAccsData = obj.takenAccs;
            if(typeof takenAccsData != 'undefined'){
                for (var key1 in takenAccsData) {
                    this.takenAccs[key1] = new BigNumber(takenAccsData[key1]);
                }
            }

            this.takenAccMemos = obj.takenAccMemos;
            this.takenOut = new BigNumber(obj.takenOut);
            this.validLimit = obj.validLimit;
            this.takeOutLimit = new BigNumber(obj.takeOutLimit);
            this.canTakeOut = obj.canTakeOut;
            this.ended = obj.ended;
        } else {
            this.id = new BigNumber(0);
            this.billName = "";
            this.receiverName = "";
            this.receiverAcc = "";
            this.initiatorName = "";
            this.initiatorAcc = "";
            this.amount = new BigNumber(0);
            this.splitNum = new BigNumber(0);
            this.billEach = new BigNumber(0);
            this.paid = new BigNumber(0);
            this.paidNum = new BigNumber(0);
            this.paidAccs = {};
            this.paidAccMemos = {};
            this.takenAccs = {};
            this.takenAccMemos = {};
            this.takenOut = new BigNumber(0);
            this.validLimit = false;
            this.takeOutLimit = new BigNumber(0);
            this.canTakeOut = false;
            this.ended = false;
        }
    }
};

//["Nasdrop Split Bill","Nasdrop","n1d8FX8a7MX7B2MPhq447pqf1Qy4NwC6rvc","Nasdrop",1,3,true]

var a = new SplitBillItem();
a.id = new BigNumber(0);
a.billName = 'Nasdrop Split Bill';
a.initiatorName = 'Nasdrop';
a.initiatorAcc = 'n1d8FX8a7MX7B2MPhq447pqf1Qy4NwC6rvc';
a.receiverName = 'Nasdrop';
a.receiverAcc = 'n1d8FX8a7MX7B2MPhq447pqf1Qy4NwC6rvc';
a.amount = new BigNumber(1);
a.splitNum = new BigNumber(3);
a.billEach = a.amount.div(a.splitNum);
a.paidAccs['n1d8FX8a7MX7B2MPhq447pqf1Qy4NwC6rvc'] = 0.5;
a.takenAccs['n1d8FX8a7MX7B2MPhq447pqf1Qy4NwC6rvc'] = 0.3;
a.paidAccMemos['n1d8FX8a7MX7B2MPhq447pqf1Qy4NwC6rvc'] = 'paidAccMemos';
a.takenAccMemos['n1d8FX8a7MX7B2MPhq447pqf1Qy4NwC6rvc'] = 'takenAccMemos';

console.log(a.toString());
console.log(new SplitBillItem(a.toString()));