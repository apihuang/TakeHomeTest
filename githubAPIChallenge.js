/**
 *                          githubAPIChallenge.js 
 * A lightweight web service that listens to github create repository events,
 * then call github API to protect the defaul main branch of the newly created
 * repository, and then make another github API call to create an issue and @mention
 * the sender self.
 * *
 */

const WebSocket = require('ws');      //use WebSokcet to let localhost receive github event
const axios = require('axios');       //axios to make rest service calls to github API


/*
 * 1. third party webhook relay site to allow localhost to receive github event via WebSocket
*/
const ws = new WebSocket('wss://my.webhookrelay.com/v1/socket');
var apiKey = 'a6b19337-0661-4a1c-ba58-84112685da1d';
var apiSecret = 'rBZcTw4onq6H';

ws.on('open', function open() {
    // on connection, send our authentication request
    ws.send(JSON.stringify({ action: 'auth', key: apiKey, secret: apiSecret }));
});

ws.on('close', function close() {
    console.log('disconnected');
});

/*
 * 2. Implemetation to react to github event
*/
ws.on('message', function incoming(data) {
    var msg = JSON.parse(data);

    //2.1 Ready for processing github create repository event
    if (msg.type === 'status' && msg.status === 'authenticated') {

        // if we got authentication confirmation, send subscribe event to the server
        ws.send(JSON.stringify({ action: 'subscribe', buckets: ['basic-forwarding-config-4u8MMT'] }));
        console.log("Ready to accept github event!");
    }


    let bodyObj = '';
    let action = '';

    if (msg.type === 'webhook') {       
        bodyObj = JSON.parse(msg.body);
        action = bodyObj.action;
    }
    if (msg.type === 'webhook' && action === 'created') {
        let repoObj = bodyObj.repository;
        let repo = repoObj.name;

        let ownerObj = repoObj.owner;
        let owner = ownerObj.login;

        let senderObj = bodyObj.sender;
        let sender = senderObj.login;    
        console.log("\nReceived github event: " + repo + " repository has just been created");

        //2.2 call rest API to pretect the main branch of a newly created repo
        var token = process.env.TOKEN;
    //    console.log(token);
        const configHeaders = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'token ' + token
            }
        };
        let payload = {
            owner: owner,
            repo: repo,
            branch: 'main',
            required_status_checks: {
                strict: true,
                contexts: [
                    'contexts'
                ]
            },
            enforce_admins: true,
            required_pull_request_reviews: {
                require_code_owner_reviews: true
            },
            restrictions: {
                users: [
                    ''
                ],
                teams: [
                    ''
                ],
                apps: [
                    ''
                ]
            }
        }
        const protectUrl = 'https://api.github.com/repos/' + owner + '/'+ repo +'/branches/main/protection';
     //   console.log('protectUrl =' + protectUrl);

        axios.put(protectUrl, payload, configHeaders
        ).then(res => {
            // + JSON.stringify(res.data)
            console.log('\nMain branch of '  + owner + '/'+ repo + ' repository has been protected according to team policy. ');
            console.log('Protection URL: ' + res.data.url);
            console.log('required_status_checks.strict:' + res.data.required_status_checks.strict);
            console.log('enforce_admins.enabled:' + res.data.enforce_admins.enabled);
            console.log('required_pull_request_reviews.require_code_owner_reviews:' + res.data.required_pull_request_reviews.require_code_owner_reviews + '\n');
        }
        ).catch(error => {
            console.log("Error at updating protection of main branch of new repo: " + error.message);
        });

        //2.3 call rest API to create an issue with @mention to self 
        const issueurl = 'https://api.github.com/repos/'+ owner + '/'+ repo + '/issues';
        let issue = {
            owner: owner,
            repo: repo,
            title: 'An Issue for Newly Created Repository',
            body: 'Hi @' + sender + ', a new ' + repo + ' repository has just been created by you, and the main branch has been protected automatically by team policy.'
        }

        axios.post(issueurl, issue, configHeaders
        ).then(res => {
            console.log('\nAn issue has been created for a newly created repository.');
            console.log('Issue title: ' + res.data.title);
            console.log('Issue URL: ' + res.data.url + '\n');

        }
        ).catch(error => {
            console.log("Error at creating issue: " + error.message);
        });

    }
})
