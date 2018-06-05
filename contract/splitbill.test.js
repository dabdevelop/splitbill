'use strict';

var HttpRequest = require("node-request");

var Nebulas = require("nebulas");
var Account = Nebulas.Account;
var Transaction = Nebulas.Transaction;
var Utils = Nebulas.Utils;
var Unit = Nebulas.Unit;



var BigNumber = require('bignumber.js');

var neb = new Nebulas.Neb();
neb.setRequest(new Nebulas.HttpRequest("https://mainnet.nebulas.io"));
var chainID = 1;
var sourceAccount = new Account("dbafc4ed12085345ac5f0ad24959c94e421b6c9e27e7de5a2ed1b4072c9f9684");

//var sourceAccount = new Account("dbafc4ed12085345ac5f0ad24959c94e421b6c9e27e7de5a2ed1b4072c9f9684");

var globalParams = {
    account: sourceAccount
};

var contract = 'n1xoMWQCgFJiRoKxwCEmx3AjNUN83Jvo7g6';
console.log(sourceAccount.getAddressString());

function deploy(){
    innerDeploy(function (params) {
        var gTx = new Nebulas.Transaction(chainID,
            params.from,
            params.to, params.value, params.nonce, params.gasPrice, params.gasLimit, params.contract);

        gTx.signTransaction();

        neb.api
            .sendRawTransaction(gTx.toProtoString())
            .then(function (resp) {
                console.log(resp);
            })
            .catch(function (err) {
               console.log(err);
            });
    });

}




deploy();
//
//setReceiverAccount(0, 'n1aedmxzq8XBb3TUgPE6ms556h5ymCkrtu2');
//setEmergency(false);
//setCanTakeout(0, true);
//emergencyTakeout('n1PJAYWYWsgAJSm5oFbQmTexZP3zNDpznqM', 0.003);
//testTakeoutOne(0, 0.001);
//testPayOne(0, 0.002);
//testPay(0);
//transferAdmin('n1PJAYWYWsgAJSm5oFbQmTexZP3zNDpznqM');
//acceptAdmin();
//end(0, true);

//setBillName(0, 'NASdrop2');
//setInitiatorName(0, 'NASdrop2 Initiator Name');
//setReceiverName(0, 'NASdrop receiverName Name');
//setLimit(0, true, 0.002);
//setPaidAccountMemo(0, "Payer 1");

function setLimit(index, validate, limit){
    //setLimit: function(_index, _validate, _limit)
    var fun = 'setLimit';
    var args = [];
    args.push(index);
    args.push(validate);
    args.push(limit);
    call(fun, args, 0, function(){});
}


function setPaidAccountMemo(index, paidAccMemo){
    //setLimit: function(_index, _validate, _limit)
    var fun = 'setPaidAccountMemo';
    var args = [];
    args.push(index);
    args.push(paidAccMemo);
    call(fun, args, 0, function(){});
}

function setBillName(index, billName){
    //setBillName: function(_index, _billName)

    var fun = 'setBillName';
    var args = [];
    args.push(index);
    args.push(billName);
    call(fun, args, 0, function(){});
}

function setInitiatorName(index, initiatorName){
    //setInitiatorName: function(_index, _initiatorName)

    var fun = 'setInitiatorName';
    var args = [];
    args.push(index);
    args.push(initiatorName);
    call(fun, args, 0, function(){});
}


function setReceiverName(index, receiverName){
    //setReceiverName: function(_index, _receiverName)

    var fun = 'setReceiverName';
    var args = [];
    args.push(index);
    args.push(receiverName);
    call(fun, args, 0, function(){});
}

function end(index, _end){
    //emergencyTakeout:function(_to, _amount)
    var fun = 'end';
    var args = [];
    args.push(index);
    args.push(_end);
    call(fun, args, 0, function(){});
}

function emergencyTakeout(to, amount){
    //emergencyTakeout:function(_to, _amount)
    var fun = 'emergencyTakeout';
    var args = [];
    args.push(to);
    args.push(amount);
    call(fun, args, 0, function(){});
}

function transferAdmin(to){
    //transferAdmin: function (_to)
    var fun = 'transferAdmin';
    var args = [];
    args.push(to);
    call(fun, args, 0, function(){});
}

function acceptAdmin(){
    //transferAdmin: function (_to)
    var fun = 'acceptAdmin';
    var args = [];
    call(fun, args, 0, function(){});
}

function setCanTakeout(index, can){
    //setCanTakeout: function(_index, _can)
    var fun = 'setCanTakeout';
    var args = [];
    args.push(index);
    args.push(can);
    call(fun, args, 0, function(){});

}

function setReceiverAccount(index, receiverAcc){
    //setReceiverAccount: function(_index, _receiverAcc)
    var fun = 'setReceiverAccount';
    var args = [];
    args.push(index);
    args.push(receiverAcc);
    call(fun, args, 0, function(){});
}


function setEmergency(_switch){
    //setEmergency: function(_emergency)
    var fun = 'setEmergency';
    var args = [];
    args.push(_switch);
    call(fun, args, 0, function(){});
}

function testTakeoutOne(index, amount){
    //takeout: function(_index, _amount)
    var fun = 'takeout';
    var args = [];
    args.push(index);
    args.push(amount);
    var value = 0;
    call(fun, args, value, function(){});
}


function testTakeout(index){
    //_billName, _receiverName, _receiverAcc, _initiatorName, _amount, _splitNum, _canTakeOut
    var fun = 'newSplitBill';
    var args = [];
    args.push('Nasdrop Split Bill');
    args.push('Nasdrop');
    args.push('n1PJAYWYWsgAJSm5oFbQmTexZP3zNDpznqM');
    args.push('Nasdrop');
    args.push(0);
    args.push(0);
    args.push(true);
    var value = 0;
    call(fun, args, value, function(){
        ////(_index, _memo)
        var fun = 'pay';
        var args = [];
        args.push(index);
        args.push('I am fine.1');
        var value = 0.005;
        call(fun, args, value,function(){
            var fun = 'pay';
            var args = [];
            args.push(index);
            args.push('I am fine.2');
            var value = 0.005;
            call(fun, args, value, function(){
                var fun = 'takeout';
                var args = [];
                args.push(index);
                args.push(0.002);
                var value = 0;
                call(fun, args, value, function(){
                    var fun = 'takeout';
                    var args = [];
                    args.push(index);
                    args.push(0.002);
                    var value = 0;
                    call(fun, args, value, function(){
                        var fun = 'pay';
                        var args = [];
                        args.push(index);
                        args.push('I am fine.5');
                        var value = 0.002;

                    });
                });
            });
        });
    });
}

function testPayOne(index, _value){
    var fun = 'pay';
    var args = [];
    args.push(index);
    args.push('I am fine.1');
    var value = _value;
    call(fun, args, value,function(){});
}

function testPay(index){
    //_billName, _receiverName, _receiverAcc, _initiatorName, _amount, _splitNum, _canTakeOut
    var fun = 'newSplitBill';
    var args = [];
    args.push('Nasdrop Split Bill');
    args.push('');
    //args.push('Nasdrop');
    //args.push(sourceAccount.getAddressString());
    args.push('');
    args.push('Nasdrop');
    //args.push('');
    args.push(0);
    args.push(0);
    args.push(true);
    var value = 0;
    call(fun, args, value, function(){
        ////(_index, _memo)
        var fun = 'pay';
        var args = [];
        args.push(index);
        args.push('I am fine.1');
        var value = 0.005;
        call(fun, args, value,function(){
            var fun = 'pay';
            var args = [];
            args.push(index);
            args.push('I am fine.2');
            var value = 0.005;
            call(fun, args, value, function(){
                var fun = 'pay';
                var args = [];
                args.push(index);
                args.push('I am fine.3');
                var value = 0.002;
                call(fun, args, value, function(){
                    var fun = 'pay';
                    var args = [];
                    args.push(index);
                    args.push('I am fine.4');
                    var value = 0.003;
                    call(fun, args, value, function(){
                    });
                });
            });
        });
    });
}



function call(fun, args, value, callback){
    console.log('call ' + contract + ' @ ' + fun + ": " +JSON.stringify(args) + ' with value: ' + value);
    innerCall(fun, args, value, function (params) {
        var address = params.from.getAddressString();
        neb.api.call({
            from: address,
            to: params.to,
            value: params.value,
            nonce: params.nonce,
            gasPrice: params.gasPrice,
            gasLimit: params.gasLimit,
            contract: params.contract
        }).then((resp) => {
            console.log(resp);
            if(resp.execute_err !== '') return;
            var Transaction = Nebulas.Transaction;
            var tx = new Transaction({
                chainID: chainID,
                from: params.from,
                to: params.to,
                value: params.value,
                nonce: params.nonce,
                gasPrice: params.gasPrice,
                gasLimit: params.gasLimit,
                contract: params.contract
            });
            tx.signTransaction();
            //send a transfer request to the NAS node
            neb.api.sendRawTransaction({
                data: tx.toProtoString()
            }).then((result) => {
                let txhash = result.txhash;
                let trigger = setInterval(() => {
                    try{
                        neb.api.getTransactionReceipt({hash: txhash}).then((receipt) => {
                            console.log('Pending transaction ...');
                            if (receipt.status != 2) //not in pending
                            {
                                console.log(JSON.stringify(receipt));
                                clearInterval(trigger);
                                callback()
                            }
                        });
                    } catch(err){
                        console.log(err);
                        clearInterval(trigger);
                    }
                }, 5000);
            });

        }).catch((err) => {
            console.log('here');
            console.log(err);
        });
    });
}



function innerCall(fun, args, value, callback) {
    let params = {};

    if (!globalParams.account) {
        return;
    }
    params.from = globalParams.account;
    params.to = contract;
    params.gasPrice = Utils.toBigNumber(1000000);
    params.gasLimit = Utils.toBigNumber(2000000);
    params.value = Utils.toBigNumber(value * Math.pow(10, 18));

    // prepare contract
    params.contract = {
        "function": fun,
        "args": JSON.stringify(args)
    };

    neb.api.getAccountState(params.from.getAddressString()).then(function (resp) {
        params.nonce = parseInt(resp.nonce) + 1;
        callback(params);
    }).catch(function (err) {
       console.log(err);
    });
}


function innerDeploy(callback){

    let params = {};

    if (!globalParams.account) {
        return;
    }
    params.from = globalParams.account;
    params.to = params.from.getAddressString();
    params.gasPrice = Utils.toBigNumber(1000000);
    params.gasLimit = Utils.toBigNumber(2000000);
    params.value = 0;

    const fs = require('fs');
    var source = fs.readFileSync('/Users/taofeng/Github/SplitBill/contract/splitbill_noadmin.js', "utf-8");

    // prepare contract
    params.contract = {
        "source": source,
        "sourceType": 'js',
        "args": ''
    };

    neb.api.getAccountState(params.to).then(function (resp) {
        params.nonce = parseInt(resp.nonce) + 1;
        callback(params);
    }).catch(function (err) {
        console.log(err);
    });


}