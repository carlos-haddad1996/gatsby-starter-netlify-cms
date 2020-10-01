import { NowRequest, NowResponse } from '@now/node';
import crypto from 'crypto';
import { create } from './_lib/oauth2';

export const randomString = () => crypto.randomBytes(4).toString(`hex`);

export default (req: NowRequest, res: NowResponse) => {
    const { host } = req.headers;

    const oauth2 = create();

    const url = oauth2.authorizationCode.authorizeURL({
        redirect_uri: `https://${host}/api/callback`,
        scope: `gatsby-starter-netlify-cms,carlos-haddad1996`,
        state: randomString(),
    });

    res.writeHead(301, { Location: url });
    res.end();
};
