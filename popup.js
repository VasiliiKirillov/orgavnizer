const addButton = document.getElementById("addButton");
const authButton = document.getElementById("signOutButton");

const sum = document.getElementById('sum');
sum.value = '123';
const description = document.getElementById('description');
const comment = document.getElementById('comment');


class SignInController {
    isSignIn = true;
    constructor(signInCB, signOutCB) {
        this.signInCB = signInCB;
        this.signOutCB = signOutCB;
    }
    setAuthState(state) {
        if (state === this.isSignIn) return;

        state ? this.signInCB() : this.signOutCB();
        this.isSignIn = state;
    }
    getAuthState() {
        return this.isSignIn;
    }
}

const signInController = new SignInController(() => {
    addButton.disabled = false;
    authButton.textContent = 'sign out';
}, () => {
    addButton.disabled = true;
    authButton.textContent = 'sign in';
});



addButton.addEventListener('click', () => {
    const data = {
        sum: sum.value,
        description: description.value,
        comment: comment.value,
    };
    chrome.runtime.sendMessage({ message: 'addDataToSheet', data }, (response) => {
        if (response) {
            console.log('addDataToSheet response', response);
        }
    });
});

authButton.addEventListener('click', () => {
    const isSignedIn = signInController.getAuthState();

    chrome.runtime.sendMessage({ message: isSignedIn ? 'signOut' : 'signIn' }, ({ success }) => {
        if (success) {
            signInController.setAuthState(!isSignedIn);
        }
    });
});

chrome.runtime.sendMessage({ message: 'getAuthStatus' }, ({ isSignIn }) => {
    console.log('gov getAuthStatus', isSignIn);
        signInController.setAuthState(isSignIn)
});
