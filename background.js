const API_KEY = 'AIzaSyDs6ETsmVmbg99qCMfzOaNZfI-3tkmeXrA';
const spreadSheetId = '1kh8e6-pT5sGwmVl8xGPXsNa-a-ht0GJ2xx5kBOeTlKE';

const addDataToSheet = async (token, data, range = 'A1:C1') => {
    const init = {
        method: 'PUT',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        'contentType': 'json',
        body: JSON.stringify({
            'values': [
                Object.values(data)
            ]
        })
    };
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}/values/${range}?key=${API_KEY}&valueInputOption=USER_ENTERED&alt=json`,
        init);
    return response.json();
}

const getToken = (interactive = true) => new Promise(resolve => chrome.identity.getAuthToken({ interactive }, resolve));

const signIn = async () => {
    try {
        await getToken();
    } catch {
        return ({ success: false });
    }
    return ({ success: true });
};

const signOut = async () => {
    const token = await getToken(false);
    if (!token) {
        return ({ success: true });
    }

    try {
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
    } catch {
        return ({ success: false });
    }

    return new Promise(resolve => {
        chrome.identity.removeCachedAuthToken({ token }, () => {
            resolve({ success: true });
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request?.message) {
        case 'addDataToSheet':
            chrome.identity.getAuthToken({interactive: true}, async (token) => {
                const response = await addDataToSheet(token, request.data);
                sendResponse({ response });
            });
            return true;
        case 'signOut':
            signOut().then(sendResponse);
            return true;
        case 'signIn':
            signIn().then(sendResponse);
            return true;
        case 'getAuthStatus':
            getToken(false).then(token => sendResponse({isSignIn: !!token}));
            return true;
    }
});
