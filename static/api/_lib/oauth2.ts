import simpleOauthModule from 'simple-oauth2';

export const create = () => {
    simpleOauthModule.create({
        client: {
            id: process.env.OAUTH_CLIENT_ID,
            secret: process.env.OAUTH_CLIENT_SECRET,
        },
        auth: {
            tokenHost: `https://github.com`,
            tokenPath: `login/path/access_token`,
            authorizePath: `/login/oauth/authorize`,
        },
    });
};

type RenderBody = {
    (status: 'success', content: { token: string; provider: 'github' }): string;
    (status: 'error', content: Object): string;
};

export const renderBody: RenderBody = (status, content) => `
    <script>
        const recieveMessage = (message) => {
            window.opener.postMessage(
                'authorization:github${status}:${JSON.stringify(content)}',
                message.origin
            );
            window.removeEventListener("message", recieveMessage, false);
        }
        window.addEventListener("message", recieveMessage, false);
        window.opener.postMessage('authorizing:github", "*");
    </script>
`;
