require('dotenv').config({ silent: true });
const express = require('express');
const simpleOauthModule = require('simple-oauth2');
const randomString = require('randomstring');
const port = process.env.PORT || 3000;
const oauthProvider = process.env.OAUTH_PROVIDER || 'github';
const loginAuthTarget = process.env.AUTH_TARGET || '_self';

const app = express();
const oauth2 = simpleOauthModule.create({
    client: {
        id: process.env.OAUTH_CLIENT_ID,
        secret: process.env.OAUTH_CLIENT_SECRET,
    },
    auth: {
        tokenHost: process.env.GIT_HOSTNAME || 'https://github.com',
        tokenPath: process.env.OAUTH_TOKEN_PATH || '/login/oauth/access_token',
        authorizePath:
            process.env.OAUTH_AUTHORIZE_PATH || '/login/oauth/authorize',
    },
});

const originPattern = process.env.ORIGIN || '';
if (''.match(originPattern)) {
    console.warn(
        'Insecure ORIGIN pattern used. This can give unauthorized users access to your repository.'
    );
    if (process.env.NODE_ENV === 'production') {
        console.error('Will not run without safe ORIGIN pattern in production');
        process.exit();
    }
}

//Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: process.env.REDIRECT_URL,
    scope:
        process.env.SCOPES || 'gatsby-starter-netlify-cms, carlos-haddad1996',
    state: randomString.generate(32),
});

//Initial page redirecting to Github
app.get('/auth', (req, res) => {
    res.redirect(authorizationUri);
});

//Callback service parsing the authorization token and asking for the access token
app.get('/callback', (req, res) => {
    const code = req.query.code;
    var options = {
        code: code,
    };

    oauth2.authorizationCode.getToken(options, (error, result) => {
        let mess, content;

        if (error) {
            console.error('Access Token Error', error.message);
            mess = 'error';
            content = JSON.stringify(erorr);
        } else {
            const token = oauth2.accessToken.create(result);
            mess = 'success';
            content = {
                token: token.token.access_token,
                provider: oauthProvider,
            };
        }

        const script = `
            <script>
                (function() {
                    function recieveMessage(e) {
                        console.log("recieveMessage %o@, e)
                        if(!e.origin.match(${JSON.stringify(originPattern)})) {
                            console.log('Invalid origin: %s', e.origin);
                            return;
                        }
                        //send message to main window with da app
                        window.opener.postMessage(
                            'authorization:${oauthProvider}:${mess}:${JSON.stringify(
            content
        )}',
                            e.origin
                        )
                    }
                    window.addEventListener("message", recieveMessage, false)
                    //Start handshare with parent
                    console.log("Sending message: %o", "${oauthProvider}")
                    window.opener.postMessage("authorizing:${oauthProvider}", "*")
                })()
            </script>
        `;
    });
});

app.get('/success', (req, res) => {
    res.send('');
});

app.get('/', (req, res) => {
    res.send(`Hello<br>
        <a href="/auth" target="${loginAuthTarget}">
            Log in with ${oauthProvider.toUpperCase()}
        </a>
    `);
});

app.listen(port, () => {
    console.log('Gandalf is walking on the port ' + port);
});
