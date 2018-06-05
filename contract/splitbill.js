"use strict";


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
            this.frozen = obj.frozen;
            this.dismissInitiator = obj.dismissInitiator;
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
            this.frozen = false;
            this.dismissInitiator = false;
        }
    }
};

var SplitBill = function () {
    LocalContractStorage.defineMapProperties(this, {
        "splitBills": {
            parse: function (text) {
                return new SplitBillItem(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        },
        "initiatorBills": {
            parse: function (text) {
                return [].concat(JSON.parse(text));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
        "payerBills": {
            parse: function (text) {
                return [].concat(JSON.parse(text));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
        "takerBills": {
            parse: function (text) {
                return [].concat(JSON.parse(text));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        },
        "receiverBills": {
            parse: function (text) {
                return [].concat(JSON.parse(text));
            },
            stringify: function (o) {
                return JSON.stringify(o);
            }
        }
    });

    LocalContractStorage.defineProperties(this, {
        _admin: '',
        _newAdmin: '',
        _emergency: false,
        _billNum: {
            stringify: function (obj) {
                return obj.toString(10);
            },
            parse: function (value) {
                return new BigNumber(value);
            }
        },
        _totalPaid: {
            stringify: function (obj) {
                return obj.toString(10);
                },
            parse: function (value) {
                return new BigNumber(value);
                }
        },
        _totalTakenOut: {
            stringify: function (obj) {
                return obj.toString(10);
            },
            parse: function (value) {
                return new BigNumber(value);
            }
        }
    });
};

SplitBill.prototype = {
    init: function () {
        this._admin = Blockchain.transaction.from;
        this._newAdmin = '';
        this._emergency = false;
        this._billNum = new BigNumber(0);
        this._totalPaid = new BigNumber(0);
        this._totalTakenOut = new BigNumber(0);
    },

    // Returns the admin of the contract
    admin: function () {
        return this._admin;
    },

    // Returns the newAdmin of the contract
    newAdmin: function () {
        return this._newAdmin;
    },

    // Returns the emergency status of contract
    emergency: function () {
        return this._emergency;
    },

    billNum: function () {
        return this._billNum.toString(10);
    },

    totalPaid: function () {
        return this._totalPaid.toString(10);
    },

    totalTakenOut: function () {
        return this._totalTakenOut.toString(10);
    },

    transferAdmin: function (_to) {
        var to = _to.trim();
        var from = Blockchain.transaction.from;
        if(from != this._admin){
            throw new Error("Permission denied.");
        }

        if(to === this._admin){
            throw new Error("Can not transfer to yourself.");
        }

        if(to === '' || Blockchain.verifyAddress(to)){
            if(from === this._admin){
                this._newAdmin = to;
            } else {
                throw new Error("Permission denied.");
            }
        } else {
            throw new Error("Invalid Address!");
        }
    },

    acceptAdmin: function () {
        var from = Blockchain.transaction.from;
        if(from !== this._newAdmin){
            throw new Error("Permission denied.");
        }
        if(this._newAdmin !== '' && from === this._newAdmin){
            this._admin = from;
            this._newAdmin = '';
        } else {
            throw new Error("Permission denied.");
        }
    },

    setEmergency: function(_emergency){
        var from = Blockchain.transaction.from;
        if(from != this._admin){
            throw new Error("Permission denied.");
        }
        if(from === this._admin){
            this._emergency = _emergency;
        } else {
            throw new Error("Permission denied.");
        }
    },

    emergencyTakeout:function(_to, _amount){
        var to = _to.trim();
        var amount = new BigNumber(_amount).mul(new BigNumber(10).pow(18));
        var from = Blockchain.transaction.from;
        if(from != this._admin){
            throw new Error("Permission denied.");
        }

        if(!Blockchain.verifyAddress(to)){
            throw new Error("Invalid address.");
        }

        if(this._emergency && from === this._admin && Blockchain.verifyAddress(to)){
            this._totalTakenOut = this._totalTakenOut.plus(amount);
            var result = Blockchain.transfer(to, amount);
            if(!result){
                throw new Error("Emergency takeout failed.");
            }
            return true;
        } else {
            throw new Error("Permission denied.");
        }
    },

    newSplitBill: function (_billName, _receiverName, _receiverAcc, _initiatorName, _amount, _splitNum, _canTakeOut) {
        var billName = _billName.trim();
        var receiverName = _receiverName.trim();
        var initiatorName = _initiatorName.trim();
        var receiverAcc = _receiverAcc.trim();
        var amount = parseFloat(_amount);
        var splitNum = parseInt(_splitNum);

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if (billName === "" || initiatorName === ""){
            throw new Error("Empty bill name / initiator name.");
        }
        if (billName.length > 64 || receiverName.length > 64 || initiatorName.length > 64){
            throw new Error("Bill name / receiver name / initiator name exceed limit length.")
        }
        if (amount < 0 || splitNum < 0){
            throw new Error("Invalid bill amount / split number.");
        }
        if(receiverAcc != '' && !Blockchain.verifyAddress(receiverAcc)){
            throw new Error("Invalid receiver address.");
        }

        if(receiverName === ""){
            receiverName = initiatorName;
        }

        var from = Blockchain.transaction.from;
        if(receiverAcc === ""){
            receiverAcc = from;
        }

        var billNum = LocalContractStorage.get("_billNum");
        var splitBill = new SplitBillItem();
        splitBill.id = billNum;
        splitBill.billName = billName;
        splitBill.receiverName = receiverName;
        splitBill.receiverAcc = receiverAcc;
        splitBill.initiatorName = initiatorName;

        splitBill.initiatorAcc = from;
        splitBill.amount = new BigNumber(_amount).mul(new BigNumber(10).pow(18));
        splitBill.splitNum = new BigNumber(splitNum);
        if(splitNum != 0){
            splitBill.billEach = splitBill.amount.div(splitBill.splitNum);
        }
        splitBill.canTakeOut = _canTakeOut;
        this.splitBills.put(billNum.toString(10), splitBill);
        this._billNum = this._billNum.plus(1);

        var receiverBill = this.receiverBills.get(receiverAcc) || [];
        receiverBill.push(parseInt(billNum.toString(10)));
        this.receiverBills.put(receiverAcc, receiverBill);
        var initiatorBill = this.initiatorBills.get(from) || [];
        initiatorBill.push(parseInt(billNum.toString(10)));
        this.initiatorBills.put(from, initiatorBill);

        return parseInt(billNum.toString(10));
    },

    pay: function (_index, _memo) {
        var index = parseInt(_index);
        var memo = _memo.trim();

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if (memo.length > 64){
            throw new Error("Memo exceed limit length.");
        }

        if(this._billNum.lte(index)) {
            throw new Error("Split bill does not exist.");
        }

        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

        var splitBillItem = this.splitBills.get(index);

        if(splitBillItem instanceof SplitBillItem){

            if(splitBillItem.frozen){
                throw new Error("Split bill has been frozen.");
            }

            if(splitBillItem.ended){
                throw new Error("Split bill has ended.");
            }

            if(!splitBillItem.billEach.equals(0) && (splitBillItem.billEach.gt(value) || splitBillItem.billEach.mul(1.02).lt(value))){
                throw new Error("Value too much or less.")
            }

            if(!splitBillItem.billEach.equals(0) && splitBillItem.paidAccs[from]){
                throw new Error("Have already paid.")
            }

            if(!splitBillItem.amount.equals(0) && splitBillItem.amount.lte(splitBillItem.paid)){
                throw new Error("Have already completed the bill.")
            }

            if(!splitBillItem.paidAccs[from]){
                splitBillItem.paidAccs[from] = new BigNumber(0);
                splitBillItem.paidNum = splitBillItem.paidNum.plus(1);
            }

            splitBillItem.paid = splitBillItem.paid.plus(value);
            this._totalPaid =  this._totalPaid.plus(value);
            splitBillItem.paidAccs[from] = splitBillItem.paidAccs[from].plus(value);
            splitBillItem.paidAccMemos[from] = memo;

            if(!splitBillItem.amount.equals(0) && splitBillItem.amount.lte(splitBillItem.paid)){
                splitBillItem.end = true;
            }

            this.splitBills.put(index, splitBillItem);
            var payerBill = this.payerBills.get(from) || [];
            if(!payerBill.includes(index)){
                payerBill.push(index);
                this.payerBills.put(from, payerBill);
            }

        } else {
            throw new Error("Split bill does not exist.");
        }

    },

    getBillByIndex: function(_index) {
        var index = parseInt(_index);
        var splitBillItem = this.splitBills.get(index);
        if(splitBillItem instanceof SplitBillItem){
            return splitBillItem;
        }
        return '';
    },

    getInitiatorBill: function(_address) {
        var address = _address.trim();
        return this.initiatorBills.get(address) || [];
    },

    getPayerBill: function(_address) {
        var address = _address.trim();
        return this.payerBills.get(address) || [];
    },

    getReceiverBill: function(_address) {
        var address = _address.trim();
        return this.receiverBills.get(address) || [];
    },

    getTakerBill: function(_address) {
        var address = _address.trim();
        return this.takerBills.get(address) || [];
    },

    queryPayerBill: function(_index, _address) {
        var index = parseInt(_index);
        var address = _address.trim();
        if(this._billNum.lte(index)){
            return  {index: index, paid: 0};
        }
        var splitBillItem = this.splitBills.get(index);
        if((splitBillItem instanceof SplitBillItem) && Blockchain.verifyAddress(address)){
            var paid = splitBillItem.paidAccs[address] || new BigNumber(0);
            return {index: index, paid: paid.toString(10)};
        } else {
            throw new Error("Invalid address");
        }
    },

    takeout: function(_index, _amount){
        var index = parseInt(_index);
        var amount = new BigNumber(_amount).mul(new BigNumber(10).pow(18));

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if(this._billNum.lte(index)){
            throw new Error("Split bill does not exist.");
        }

        var splitBillItem = this.splitBills.get(index);
        if(!(splitBillItem instanceof SplitBillItem)){
            throw new Error("Split bill does not exist.");
        }

        if(splitBillItem.frozen){
            throw new Error("Split bill has been frozen.");
        }

        if(!splitBillItem.canTakeOut){
            throw new Error("Permission denied.");
        }

        if(splitBillItem.paid.lt(splitBillItem.takenOut.plus(amount)) || amount.lte(new BigNumber(0))){
            throw new Error("Invalid amount.");
        }

        if(splitBillItem.validLimit && splitBillItem.takeOutLimit.lt(amount)){
            throw new Error("Invalid amount.");
        }

        var from = Blockchain.transaction.from;

        if(from !== splitBillItem.receiverAcc){
            throw new Error("Permission denied.");
        }

        if(from === splitBillItem.receiverAcc && !this._emergency && splitBillItem.canTakeOut && splitBillItem.paid.gte(splitBillItem.takenOut.plus(amount))){
            if(!splitBillItem.takenAccs[from]){
                splitBillItem.takenAccs[from] = new BigNumber(0);
                splitBillItem.takenAccMemos[from] = splitBillItem.receiverName;
            }

            this._totalTakenOut = this._totalTakenOut.plus(amount);
            splitBillItem.takenAccs[from] = splitBillItem.takenAccs[from].plus(amount);
            splitBillItem.takenOut = splitBillItem.takenOut.plus(amount);
            splitBillItem.takeOutLimit = splitBillItem.takeOutLimit.minus(amount);

            if(splitBillItem.takeOutLimit.lte(new BigNumber(0))){
                splitBillItem.takeOutLimit = new BigNumber(0);
            }

            this.splitBills.put(index, splitBillItem);

            var takerBill = this.takerBills.get(from) || [];
            if(!takerBill.includes(index)){
                takerBill.push(index);
                this.takerBills.put(from, takerBill);
            }

            var result = Blockchain.transfer(from, amount);
            if(!result){
                throw new Error("Takeout failed.");
            }
            this.transferEvent(true, Blockchain.transaction.to, from, amount);
            return true;
        } else {
            throw new Error("Permission denied.");
        }
    },

    setCanTakeout: function(_index, _can){
        var index = parseInt(_index);

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if(this._billNum.lte(index)){
            throw new Error("Split bill does not exist.");
        }

        var splitBillItem = this.splitBills.get(index);
        if(!(splitBillItem  instanceof SplitBillItem)){
            throw new Error("Split bill does not exist.");
        }

        var from = Blockchain.transaction.from;

        if(splitBillItem.initiatorAcc !== from && this._admin !== from){
            throw new Error("Permission denied.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.frozen){
            throw new Error("Split bill has been frozen.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.dismissInitiator){
            throw new Error("Your initiator's right has been dismissed.");
        }

        if(splitBillItem.initiatorAcc === from || this._admin === from){
            splitBillItem.canTakeOut = _can;
            this.splitBills.put(index, splitBillItem);
        } else {
            throw new Error("Permission denied.");
        }
    },

    setLimit: function(_index, _validate, _limit){
        var index = parseInt(_index);
        var limit = new BigNumber(_limit).mul(new BigNumber(10).pow(18));

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if(this._billNum.lte(index)){
            throw new Error("Split bill does not exist.");
        }

        if(_validate && limit.lt(new BigNumber(0))){
            throw new Error("Invalid limit.");
        }

        var splitBillItem = this.splitBills.get(index);
        if(!(splitBillItem  instanceof SplitBillItem)){
            throw new Error("Split bill does not exist.");
        }

        var from = Blockchain.transaction.from;

        if(splitBillItem.initiatorAcc !== from && this._admin !== from){
            throw new Error("Permission denied.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.frozen){
            throw new Error("Split bill has been frozen.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.dismissInitiator){
            throw new Error("Your initiator's right has been dismissed.");
        }

        if(splitBillItem.initiatorAcc === from || this._admin === from){
            splitBillItem.validLimit = _validate;
            if(splitBillItem.validLimit){
                splitBillItem.takeOutLimit = limit;
            } else {
                splitBillItem.takeOutLimit = new BigNumber(0);
            }
            this.splitBills.put(index, splitBillItem);
        } else {
            throw new Error("Permission denied.");
        }
    },

    dismissInitiator: function (_index, _dismiss) {
        var index = parseInt(_index);

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if(this._billNum.lte(index)){
            throw new Error("Split bill does not exist.");
        }

        var splitBillItem = this.splitBills.get(index);

        if(!(splitBillItem instanceof SplitBillItem)){
            throw new Error("Split bill does not exist.");
        }

        var from = Blockchain.transaction.from;

        if(this._admin !== from){
            throw new Error("Permission denied.");
        }

        if(splitBillItem instanceof SplitBillItem){
            if(this._admin === from){
                splitBillItem.dismissInitiator = _dismiss;
                this.splitBills.put(index, splitBillItem);
            } else {
                throw new Error("Permission denied.");
            }
        } else {
            throw new Error("Split bill does not exist.");
        }
    },

    freeze: function (_index, _freeze) {
        var index = parseInt(_index);

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if(this._billNum.lte(index)){
            throw new Error("Split bill does not exist.");
        }

        var splitBillItem = this.splitBills.get(index);

        if(!(splitBillItem instanceof SplitBillItem)){
            throw new Error("Split bill does not exist.");
        }

        var from = Blockchain.transaction.from;

        if(this._admin !== from){
            throw new Error("Permission denied.");
        }

        if(splitBillItem instanceof SplitBillItem){
            if(this._admin === from){
                splitBillItem.frozen = _freeze;
                this.splitBills.put(index, splitBillItem);
            } else {
                throw new Error("Permission denied.");
            }
        } else {
            throw new Error("Split bill does not exist.");
        }
    },

    end: function (_index, _ended) {
        var index = parseInt(_index);

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if(this._billNum.lte(index)){
            throw new Error("Split bill does not exist.");
        }

        var splitBillItem = this.splitBills.get(index);

        if(!(splitBillItem instanceof SplitBillItem)){
            throw new Error("Split bill does not exist.");
        }

        var from = Blockchain.transaction.from;

        if(splitBillItem.initiatorAcc !== from && this._admin !== from){
            throw new Error("Permission denied.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.frozen){
            throw new Error("Split bill has been frozen.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.dismissInitiator){
            throw new Error("Your initiator's right has been dismissed.");
        }

        if(splitBillItem instanceof SplitBillItem){
            if(splitBillItem.initiatorAcc === from  || this._admin === from){
                splitBillItem.ended = _ended;
                this.splitBills.put(index, splitBillItem);
            } else {
                throw new Error("Permission denied.");
            }
        } else {
            throw new Error("Split bill does not exist.");
        }
    },

    setBillName: function(_index, _billName){
        var index = parseInt(_index);
        var billName = _billName.trim();

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if(this._billNum.lte(index)){
            throw new Error("Split bill does not exist.");
        }

        var splitBillItem = this.splitBills.get(index);

        if(!(splitBillItem  instanceof SplitBillItem)){
            throw new Error("Split bill does not exist.");
        }

        var from = Blockchain.transaction.from;

        if(splitBillItem.initiatorAcc !== from && this._admin !== from){
            throw new Error("Permission denied.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.frozen){
            throw new Error("Split bill has been frozen.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.dismissInitiator){
            throw new Error("Your initiator's right has been dismissed.");
        }

        if(splitBillItem instanceof SplitBillItem){
            if(splitBillItem.initiatorAcc === from  || this._admin === from){
                splitBillItem.billName = billName;
                this.splitBills.put(index, splitBillItem);
            } else {
                throw new Error("Permission denied.");
            }
        } else {
            throw new Error("Split bill does not exist.");
        }
    },

    setInitiatorName: function(_index, _initiatorName){
        var index = parseInt(_index);
        var initiatorName = _initiatorName.trim();

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if(this._billNum.lte(index)){
            throw new Error("Split bill does not exist.");
        }

        var splitBillItem = this.splitBills.get(index);

        if(!(splitBillItem instanceof SplitBillItem)){
            throw new Error("Split bill does not exist.");
        }

        var from = Blockchain.transaction.from;

        if(splitBillItem.initiatorAcc !== from && this._admin !== from){
            throw new Error("Permission denied.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.frozen){
            throw new Error("Split bill has been frozen.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.dismissInitiator){
            throw new Error("Your initiator's right has been dismissed.");
        }

        if(splitBillItem instanceof SplitBillItem){
            if(splitBillItem.initiatorAcc === from  || this._admin === from){
                splitBillItem.initiatorName = initiatorName;
                this.splitBills.put(index, splitBillItem);
            } else {
                throw new Error("Permission denied.");
            }
        } else {
            throw new Error("Split bill does not exist.");
        }
    },

    setReceiverName: function(_index, _receiverName){
        var index = parseInt(_index);
        var receiverName = _receiverName.trim();

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if(this._billNum.lte(index)){
            throw new Error("Split bill does not exist.");
        }

        var splitBillItem = this.splitBills.get(index);

        if(!(splitBillItem instanceof SplitBillItem)){
            throw new Error("Split bill does not exist.");
        }

        var from = Blockchain.transaction.from;

        if(splitBillItem.initiatorAcc !== from && this._admin !== from && splitBillItem.receiverAcc !== from){
            throw new Error("Permission denied.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.frozen){
            throw new Error("Split bill has been frozen.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.dismissInitiator){
            throw new Error("Your initiator's right has been dismissed.");
        }

        if(splitBillItem instanceof SplitBillItem){
            if(splitBillItem.initiatorAcc === from  || this._admin === from || splitBillItem.receiverAcc === from){
                splitBillItem.receiverName = receiverName;
                this.splitBills.put(index, splitBillItem);
            } else {
                throw new Error("Permission denied.");
            }
        } else {
            throw new Error("Split bill does not exist.");
        }
    },

    setReceiverAccount: function(_index, _receiverAcc){
        var index = parseInt(_index);
        var receiverAcc = _receiverAcc.trim();

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if(this._billNum.lte(index)){
            throw new Error("Split bill does not exist.");
        }

        var splitBillItem = this.splitBills.get(index);

        if(!(splitBillItem instanceof SplitBillItem)){
            throw new Error("Split bill does not exist.");
        }

        if(!Blockchain.verifyAddress(receiverAcc)){
            throw new Error("Invalid address.");
        }

        var from = Blockchain.transaction.from;

        if(splitBillItem.initiatorAcc !== from  && this._admin !== from && splitBillItem.receiverAcc !== from){
            throw new Error("Permission denied.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.frozen){
            throw new Error("Split bill has been frozen.");
        }

        if(splitBillItem.initiatorAcc === from && splitBillItem.dismissInitiator){
            throw new Error("Your initiator's right has been dismissed.");
        }

        if(splitBillItem instanceof SplitBillItem){
            if(splitBillItem.initiatorAcc === from || splitBillItem.receiverAcc === from || this._admin === from){
                var receiverBill = this.receiverBills.get(receiverAcc) || [];
                if(!receiverBill.includes(index)){
                    receiverBill.push(index);
                    this.receiverBills.put(receiverAcc, receiverBill);
                }
                splitBillItem.receiverAcc = receiverAcc;
                this.splitBills.put(index, splitBillItem);
            } else {
                throw new Error("Permission denied.");
            }
        } else {
            throw new Error("Split bill does not exist.");
        }
    },

    setPaidAccountMemo: function(_index, _paidAccMemo){
        var index = parseInt(_index);
        var paidAccMemo = _paidAccMemo.trim();

        if(this._emergency){
            throw new Error("In emergency. Permission denied.");
        }

        if(this._billNum.lte(index)){
            throw new Error("Split bill does not exist.");
        }

        var splitBillItem = this.splitBills.get(index);

        if(!(splitBillItem instanceof SplitBillItem)){
            throw new Error("Split bill does not exist.");
        }

        var from = Blockchain.transaction.from;

        if(splitBillItem instanceof SplitBillItem){
            if(typeof splitBillItem.paidAccs[from] !== 'undefined'){
                splitBillItem.paidAccMemos[from] = paidAccMemo;
                this.splitBills.put(index, splitBillItem);
            } else {
                throw new Error("Permission denied.");
            }
        } else {
            throw new Error("Split bill does not exist.");
        }
    },

    transferEvent: function (status, from, to, value) {
        Event.Trigger('takeout', {
            Status: status,
            Transfer: {
                from: from,
                to: to,
                value: value.toString(10)
            }
        });
    }

};

module.exports = SplitBill;